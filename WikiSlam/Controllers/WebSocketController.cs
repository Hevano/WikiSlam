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

        [Route("/socket")]
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
                if (!await HandleMessage(msg, webSocket, user))
                {
                    System.Console.WriteLine($"Could not handle message from user: {user?.Name}");
                    break;
                }

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
                if(!_userWebSockets.TryRemove(user.Id, out var ws))
                {
                    Console.WriteLine("Could not remove websocket from dict");
                }
            }
        }

        private async Task<bool> HandleMessage(string msg, WebSocket webSocket, User? user)
        {
            //parse msg as json
            JObject jsonMsg = JObject.Parse(msg);

            //Validate json
            if (jsonMsg == null) return false;
            if (!jsonMsg.TryGetValue("actionType", out var actionType)) return false;
            if (!jsonMsg.TryGetValue("userId", out var userId)) return false;

            //If the user id we receive is not the same as the user we have, there is something wrong
            if (user != null && userId.ToObject<int>() != user.Id) return false;

            //verify user still exists
            var foundUser = await _dbContext.Users.FindAsync(userId.ToObject<int>());
            if (foundUser == null) return false;

            //If user has another websocket open somewhere, we need to close that
            if (_userWebSockets.ContainsKey(foundUser.Id) && _userWebSockets[foundUser.Id] != webSocket)
            {
                if (_userWebSockets[foundUser.Id].State != WebSocketState.Closed)
                {
                    await _userWebSockets[foundUser.Id].CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
                }
                _userWebSockets[foundUser.Id] = webSocket;
                user = foundUser;
            } else if (user == null) 
            {
                //Set up this socket's user if that has not been done
                user = foundUser;
                if(!_userWebSockets.TryAdd(user.Id, webSocket))
                {
                    Console.WriteLine($"Failed to add socket to dict for user: {user.Name}");
                }
            }

            //perform logic based on the action type
            JObject broadcastMsg = new JObject();
            switch (actionType.ToString())
            {
                case "join":
                    broadcastMsg.Add("user", JToken.FromObject(user, new JsonSerializer()));
                    broadcastMsg.Add("actionType", "join");
                    await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                    return true;
                case "rename":
                    broadcastMsg.Add("user", jsonMsg.GetValue("user"));
                    broadcastMsg.Add("actionType", "rename");
                    await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                    return true;
                case "start":
                    broadcastMsg = new JObject();
                    broadcastMsg["actionType"] = "start";

                    //update lobby round start timestamp
                    //TODO: Remove all previously saved articles
                    var lobby = await _dbContext.Lobbies.FindAsync(user.LobbyId);
                    if (lobby == null) return false;
                    lobby.RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                    await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                    _dbContext.Entry(lobby).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                    await _dbContext.SaveChangesAsync();
                    return true;
                case "leave":
                    return false;
                case "article":
                    broadcastMsg.Add("article", jsonMsg.GetValue("article"));
                    broadcastMsg.Add("actionType", "article");
                    await BroadcastToLobbyAsync(user.LobbyId, broadcastMsg.ToString());
                    return true;
                case "ping":
                    return true;
                default:
                    return false;
            }
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
