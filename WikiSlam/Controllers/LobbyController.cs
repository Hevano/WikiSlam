using Microsoft.AspNetCore.Http;
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

        [HttpGet("{code}")]
        public async Task<ActionResult<Lobby>> GetLobbyFromCode(string code)
        {
            //Lobby codes must be 3 characters
            if(code.Length != 3)
            {
                return BadRequest();
            }
            if (_dbContext.Lobbies.IsNullOrEmpty())
            {
                return NotFound();
            }
            var lobby = await _dbContext.Lobbies.Where(l => l.Code.Equals(code)).FirstAsync();
            if (lobby == null)
            {
                return NotFound();
            }
            return lobby;
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
            LobbyCodeIndex += System.Random.Shared.Next(1, 5);
            var lobby = new Lobby();
            lobby.Code = Lobby.IdToCode(LobbyCodeIndex);
            lobby.CreationTimestamp = DateTime.Now;
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
