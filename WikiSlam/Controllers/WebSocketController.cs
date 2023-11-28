using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using WikiSlam.DAL;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using WikiSlam.Models;

namespace WikiSlam.Controllers
{
    [ApiController]
    public class WebSocketController : ControllerBase
    {
        private readonly WikiSlamContext _dbContext;
        private static ConcurrentDictionary<int, WebSocket> _userWebSockets = new ConcurrentDictionary<int, WebSocket>();
        public WebSocketController(WikiSlamContext wikiSlamContext)
        {
            _dbContext = wikiSlamContext;
        }

        [Route("/ws")]
        public async Task Get()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await RunWebSocket(webSocket);
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }

        private async Task RunWebSocket(WebSocket webSocket)
        {
            var buffer = new byte[1024 * 4];
            var receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), CancellationToken.None);

            User? user = null;

            while (!receiveResult.CloseStatus.HasValue)
            {
                string msg = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);

                //If we cannot handle the message, close the connection
                if (!await HandleMessage(msg, webSocket, user)) break;

                receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer), CancellationToken.None);
            }
            await webSocket.CloseAsync(
                receiveResult.CloseStatus.Value,
                receiveResult.CloseStatusDescription,
                CancellationToken.None);

            if(user != null)
            {
                JObject broadcastMsg = new JObject();
                broadcastMsg.Add("user", JToken.FromObject(user, new JsonSerializer()));
                broadcastMsg.Add("actionType", "leave");
                await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                _userWebSockets.TryRemove(user.Id, out var ws);
            }
        }

        //TODO: Time out connections after round duration passes with no input
        private async Task<bool> HandleMessage(string msg, WebSocket webSocket, User? user)
        {
            //parse msg as json
            JObject jsonMsg = JObject.Parse(msg);

            //If the user id we receive is not the same as the user we have, there is something wrong
            if (user != null && jsonMsg["userId"].ToObject<int>() != user.Id) return false;

            //verify user id is valid
            var foundUser = await _dbContext.Users.FindAsync(jsonMsg["userId"].ToObject<int>());
            if (foundUser == null) return false;

            //Set up this socket's user if that has not been done
            if (user == null)
            {
                user = foundUser;
                _userWebSockets.TryAdd(user.Id, webSocket);
            } else if (_userWebSockets[user.Id] != webSocket) //Replace websocket if we need to
            {
                await _userWebSockets[user.Id].CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
                _userWebSockets[user.Id] = webSocket;
            }

            //perform logic based on the action type
            JObject broadcastMsg = new JObject();
            if (jsonMsg.TryGetValue("actionType", out var actionType))
            {
                switch ((string)actionType)
                {
                    case "join":
                        broadcastMsg.Add("user", JToken.FromObject(user, new JsonSerializer()));
                        broadcastMsg.Add("actionType", "join");
                        await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                        break;
                    case "start":
                        broadcastMsg = new JObject();
                        broadcastMsg["actionType"] = "start";
                        await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                        break;
                    case "leave":
                        return false;
                    case "article":
                        broadcastMsg.Add("user", jsonMsg.GetValue("article"));
                        broadcastMsg.Add("actionType", "article");
                        await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                        break;
                    default:
                        return false;
                }
                return true;
            }
            return false;
        }

        private async Task BroadcastToLobbyAsync(int lobbyId, string message)
        {
            var lobbyUsers = await _dbContext.Users.Where(u => u.LobbyId == lobbyId).Select(u => u.Id).ToListAsync();
            foreach (var userId in lobbyUsers)
            {
                
                if (_userWebSockets.TryGetValue(userId, out var socket) 
                    && socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(System.Text.Encoding.UTF8.GetBytes(message), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }
}
