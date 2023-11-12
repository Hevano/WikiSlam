using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WikiSlam.DAL;
using WikiSlam.Models;

namespace WikiSlam.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly WikiSlamContext _dbContext;
        public UserController(WikiSlamContext wikiSlamContext)
        {
            _dbContext = wikiSlamContext;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            if (_dbContext.Users == null)
            {
                return NotFound();
            }
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            if (_dbContext.Users == null)
            {
                return NotFound();
            }

            return await _dbContext.Users.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<IEnumerable<User>>> AddUserToLobby([FromBody] UserLogin userLogin)
        {
            if(userLogin.Code.Length != 3 || userLogin.Name.Length > 12 || 1 > userLogin.Name.Length)
            {
                return BadRequest();
            }
            if(_dbContext.Lobbies == null)
            {
                return NotFound();
            }
            var user = new User();
            user.Name = userLogin.Name;
            var userLobby = await _dbContext.Lobbies.Where(l => l.Code == userLogin.Code).FirstOrDefaultAsync();
            if (userLobby == null)
            {
                return NotFound();
            }
            user.LobbyId = userLobby.Id;
            var newUser = _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = newUser.Entity.Id }, newUser.Entity);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<User>> UpdateUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }
            _dbContext.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if ((_dbContext.Users?.Any(l => l.Id == user.Id)).GetValueOrDefault())
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
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
