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
    public class ArticleController : ControllerBase
    {
        private readonly WikiSlamContext _dbContext;
        public ArticleController(WikiSlamContext wikiSlamContext)
        {
            _dbContext = wikiSlamContext;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Article>> GetArticle(int id)
        {
            if (_dbContext.Articles.IsNullOrEmpty())
            {
                return NotFound();
            }
            var article = await _dbContext.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound();
            }
            return article;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
        {
            if (_dbContext.Articles.IsNullOrEmpty())
            {
                return NotFound();
            }
            return _dbContext.Articles.ToList(); //TODO: figure out why this can't be async
        }

        [HttpPost]
        public async Task<ActionResult<Article>> CreateArticle(Article article)
        {
            if (_dbContext.Users.IsNullOrEmpty())
            {
                return NotFound();
            }
            var user = await _dbContext.Users.FindAsync(article.UserId);
            if (user == null)
            {
                return NotFound();
            }

            //Block new articles once the round has ended
            var lobby = await _dbContext.Lobbies.FindAsync(user.LobbyId);
            if(lobby == null)
            {
                return NotFound();
            }
            if (lobby.RoundStartTimestamp + lobby.RoundDuration.TotalSeconds < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return Conflict();
            }

            //Remove any other articles this user owns
            var userArticles = _dbContext.Articles.Where(a => a.UserId == article.UserId).ToList(); //TODO: figure out why this can't be async
            if (!userArticles.IsNullOrEmpty())
            {
                _dbContext.Articles.RemoveRange(userArticles);
                await _dbContext.SaveChangesAsync();
            }

            _dbContext.Articles.Add(article);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArticle(long id, Article article)
        {
            if (id != article.Id)
            {
                return BadRequest();
            }

            if(_dbContext.Articles.Find(article.Id) == null)
            {
                return NotFound();
            }

            
            var user = await _dbContext.Users.FindAsync(article.UserId);

            if(user == null)
            {
                return NotFound();
            }

            //Block article updates once round has ended
            var lobby = await _dbContext.Lobbies.FindAsync(user.LobbyId);
            if(lobby.RoundStartTimestamp + lobby.RoundDuration.TotalSeconds < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return Conflict();
            }

            _dbContext.Entry(article).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if ((_dbContext.Articles?.Any(l => l.Id == article.Id)).GetValueOrDefault())
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
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var article = await _dbContext.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound();
            }

            _dbContext.Articles.Remove(article);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
