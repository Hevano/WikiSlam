﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WikiSlam.DAL;
using WikiSlam.Models;
using System.Linq;
using Microsoft.IdentityModel.Tokens;

namespace WikiSlam.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LobbyController : ControllerBase
    {
        public static int LobbyCodeIndex = 0;
        private readonly WikiSlamContext _dbContext;
        public LobbyController(WikiSlamContext wikiSlamContext)
        {
            _dbContext = wikiSlamContext;
        }

        private int IncrementLobbyIndex()
        {
            LobbyCodeIndex += System.Random.Shared.Next(1, 5);
            if (LobbyCodeIndex > 17576) LobbyCodeIndex = 0;
            return LobbyCodeIndex;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lobby>>> GetLobbies()
        {
            if (_dbContext.Lobbies.IsNullOrEmpty())
            {
                return NotFound();
            }
            return await _dbContext.Lobbies.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Lobby>> GetLobby(int id)
        {
            if (_dbContext.Lobbies.IsNullOrEmpty())
            {
                return NotFound();
            }
            var lobby = await _dbContext.Lobbies.FindAsync(id);
            if (lobby == null)
            {
                return NotFound();
            }
            return lobby;
        }

        [Route("{id}/users")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetLobbyUsers(int id)
        {
            if (_dbContext.Lobbies.IsNullOrEmpty())
            {
                return NotFound();
            }
            var lobby = await _dbContext.Lobbies.FindAsync(id);
            if (lobby == null)
            {
                return NotFound();
            }

            return await _dbContext.Users.Where(user => user.LobbyId == id).ToListAsync();
        }

        [Route("{id}/results")]
        [HttpGet]
        public async Task<ActionResult<RoundResults>> GetLobbyResults(int id)
        {
            if (_dbContext.Lobbies.IsNullOrEmpty())
            {
                return NotFound();
            }
            var lobby = await _dbContext.Lobbies.FindAsync(id);
            if (lobby == null)
            {
                return NotFound();
            }

            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            //Ensure that the round time has elapsed already
            if (lobby.RoundStartTimestamp + lobby.RoundDuration.TotalSeconds > now)
            {
                return Conflict();
            }

            var articles = await _dbContext.Users
                .Where(user => user.LobbyId == id)
                .Join(
                    _dbContext.Articles,
                    user => user.Id,
                    article => article.UserId,
                    (user, article) => article
                 ).ToListAsync();

            if (articles.IsNullOrEmpty())
            {
                return NotFound();
            }

            var roundResults = new RoundResults(id);

            foreach(var article in articles)
            {
                var result = new ResultEntry(article, await _dbContext.Users.FindAsync(article.UserId));
                foreach (var enemyArticle in articles)
                {
                    if (article == enemyArticle) continue;
                    int matchupScore = article.Compare(enemyArticle);
                    result.Score += matchupScore;
                    result.WinLossRecord.Add(enemyArticle.Id, matchupScore);
                }
                roundResults.resultsList.Add(result);
            }

            roundResults.resultsList.Sort((lhs, rhs) => rhs.Score.CompareTo(lhs.Score));
            roundResults.Winner = roundResults.resultsList.First().Article.Id;

            return roundResults;
        }

        [Route("{id}/articles")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Article>>> GetLobbyArticles(int id)
        {
            if (_dbContext.Lobbies.IsNullOrEmpty())
            {
                return NotFound();
            }
            var lobby = await _dbContext.Lobbies.FindAsync(id);
            if (lobby == null)
            {
                return NotFound();
            }

            //Queries the articles that have a user in the room specified by id
            var articleQuery = _dbContext.Users
                .Where(user => user.LobbyId == id)
                .Join(
                    _dbContext.Articles,
                    user => user.Id,
                    article => article.UserId,
                    (user, article) => article
                 );

            return await articleQuery.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<LobbyCreationResponse>> CreateLobby([FromBody] AdminLogin admin)
        {
            //Validate admin name
            if (admin.Name.Length > 12 || 1 > admin.Name.Length)
            {
                return BadRequest();
            }

            //Create Lobby
            var lobby = new Lobby();
            lobby.Code = Lobby.IdToCode(IncrementLobbyIndex());
            lobby.CreationTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            lobby.RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            lobby.RoundDuration = TimeSpan.FromMinutes(2);
            var createdLobby = _dbContext.Lobbies.Add(lobby);
            await _dbContext.SaveChangesAsync();

            //Create User
            var user = new User();
            user.Name = admin.Name;
            user.LobbyId = createdLobby.Entity.Id;
            user.IsAdmin = true;
            var createdUser = _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var response = new LobbyCreationResponse(createdLobby.Entity, createdUser.Entity);

            return CreatedAtAction(nameof(GetLobby), new { id = createdLobby.Entity.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Lobby>> UpdateLobby(int id, Lobby lobby)
        {
            if(id != lobby.Id)
            {
                return BadRequest();
            }

            if((await _dbContext.Lobbies.FindAsync(id)) == null)
            {
                return NotFound();
            }

            _dbContext.Entry(lobby).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if ((_dbContext.Lobbies?.Any(l => l.Id == lobby.Id)).GetValueOrDefault())
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLobby(int id)
        {
            var lobby = await _dbContext.Lobbies.FindAsync(id);
            if (lobby == null)
            {
                return NotFound();
            }

            _dbContext.Lobbies.Remove(lobby);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
