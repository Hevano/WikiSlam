using EntityFrameworkCore.Testing.Moq;
using WikiSlam.Models;
using WikiSlam.Controllers;
using WikiSlam.DAL;
using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;

namespace WikiSlamTest
{
    [TestFixture]
    public class ArticleControllerTests
    {
        private WikiSlamContext _dbContext;
        private ArticleController _articleController;

        [SetUp]
        public void SetUp()
        {
            _dbContext = Create.MockedDbContextFor<WikiSlamContext>();
            _dbContext.Articles.Add(new Article { Id = 1, Title = "Title", Image = "Image" });
            _dbContext.SaveChanges();

            _articleController = new ArticleController(_dbContext);
        }

        [Test]
        public async Task GetArticle_ValidId_Success()
        {
            var response = await _articleController.GetArticle(1);

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Id, Is.EqualTo(1));
        }

        [Test]
        public async Task GetArticle_InvalidId_NotFound()
        {
            var response = await _articleController.GetArticle(10);

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Value, Is.Null);
        }

        [Test]
        public async Task GetArticles_EmptyDatabase_EmptyList()
        {
            _dbContext.Remove(_dbContext.Articles.Find(1));
            _dbContext.SaveChanges();
            var response = await _articleController.GetArticles();

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Value, Is.Null);
        }

        [Test]
        public async Task GetArticles_OneArticleExists_SingleListEntry()
        {
            var response = await _articleController.GetArticles();

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Count, Is.EqualTo(1));
        }

        [Test]
        public async Task GetArticles_ThreeArticlesExist_ThreeListEntries()
        {
            _dbContext.Articles.Add(new Article { Id = 2, Title = "Title2", Image = "Image2" });
            _dbContext.Articles.Add(new Article { Id = 3, Title = "Title3", Image = "Image3" });
            _dbContext.SaveChanges();
            var response = await _articleController.GetArticles();

            Assert.That(response, Is.Not.Null);
            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Count, Is.EqualTo(3));
        }

        [Test]
        public async Task CreateArticle_LobbyAndUserExist_CreatedAt()
        {
            _dbContext.Lobbies.Add(new Lobby { 
                Id = 1, 
                Code = "AAA", 
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(), 
                RoundDuration = TimeSpan.FromMinutes(2) 
            });
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.SaveChanges();

            var response = await _articleController.CreateArticle(new Article { Title = "Title", UserId = 1, Image="Image" });
            Assert.That(response.Result, Is.TypeOf<CreatedAtActionResult>());
            Assert.That(response.Result, Is.Not.Null);

            var createdAtActionResult = (CreatedAtActionResult)response.Result;

            Assert.That(createdAtActionResult.Value, Is.Not.Null);
            Assert.That(createdAtActionResult.Value, Is.TypeOf<Article>());

            var resultArticle = (Article)createdAtActionResult.Value;

            Assert.That(resultArticle.Title, Is.EqualTo("Title"));
            Assert.That(resultArticle.UserId, Is.EqualTo(1));

            var dbArticle = _dbContext.Articles.Find(resultArticle.Id);
            Assert.That(resultArticle, Is.EqualTo(dbArticle));
        }

        [Test]
        public async Task CreateArticle_UserHasExistingArticle_CreatedAt()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.Articles.Add(new Article { Id = 2, UserId = 1, Title = "Title1", Image="Image" });
            _dbContext.SaveChanges();

            var response = await _articleController.CreateArticle(new Article { Title = "Title2", UserId = 1, Image = "Image2" });
            Assert.That(response.Result, Is.TypeOf<CreatedAtActionResult>());
            Assert.That(response.Result, Is.Not.Null);

            var createdAtActionResult = (CreatedAtActionResult)response.Result;

            Assert.That(createdAtActionResult.Value, Is.Not.Null);
            Assert.That(createdAtActionResult.Value, Is.TypeOf<Article>());

            var resultArticle = (Article)createdAtActionResult.Value;

            Assert.That(resultArticle.Title, Is.EqualTo("Title2"));
            Assert.That(resultArticle.UserId, Is.EqualTo(1));

            var dbArticle = _dbContext.Articles.Find(resultArticle.Id);
            Assert.That(resultArticle, Is.EqualTo(dbArticle));
        }

        [Test]
        public async Task CreateArticle_RoundEnded_Conflict()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - 160,
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.SaveChanges();

            var response = await _articleController.CreateArticle(new Article { Title = "Title2", UserId = 1, Image = "Image2" });
            Assert.That(response.Result, Is.TypeOf<ConflictResult>());

            var dbArticle = _dbContext.Articles.Where(a => a.Title == "Title2").Any();
            Assert.That(dbArticle, Is.False);
        }

        [Test]
        public async Task CreateArticle_UserDoesntExist_NotFound()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.SaveChanges();

            var response = await _articleController.CreateArticle(new Article { Title = "Title2", UserId = 3, Image = "Image2" });
            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());

            var dbArticle = _dbContext.Articles.Where(a => a.Title == "Title2").Any();
            Assert.That(dbArticle, Is.False);
        }

        [Test]
        public async Task CreateArticle_LobbyDoesntExist_NotFound()
        {
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.SaveChanges();

            var response = await _articleController.CreateArticle(new Article { Title = "Title2", UserId = 1, Image = "Image2" });
            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());

            var dbArticle = _dbContext.Articles.Where(a => a.Title == "Title2").Any();
            Assert.That(dbArticle, Is.False);
        }

        [Test]
        public async Task UpdateArticle_ArticleExists_NoContent()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.Articles.Add(new Article { Id = 2, UserId = 1, Title = "Title2", Image = "Image2" });
            _dbContext.SaveChanges();

            var updatedArticle = _dbContext.Articles.Find(2);
            updatedArticle.Level++;
            updatedArticle.Strength++;
            updatedArticle.Dexterity++;
            updatedArticle.Willpower++;

            var response = await _articleController.UpdateArticle(2, updatedArticle);

            Assert.That(response, Is.TypeOf<NoContentResult>());
            var dbArticle = _dbContext.Articles.Find(2);
            Assert.That(updatedArticle, Is.EqualTo(dbArticle));
        }

        [Test]
        public async Task UpdateArticle_IdMismatch_BadRequest()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.Articles.Add(new Article { Id = 2, UserId = 1, Title = "Title2", Image = "Image2" });
            _dbContext.SaveChanges();

            var existingArticle = _dbContext.Articles.Find(2);
            var updatedArticle = new Article { 
                Id = existingArticle.Id, 
                UserId = existingArticle.UserId, 
                Title = existingArticle.Title, 
                Image = existingArticle.Image 
            };
            updatedArticle.Level++;

            var response = await _articleController.UpdateArticle(1, updatedArticle);

            Assert.That(response, Is.TypeOf<BadRequestResult>());
            var dbArticle = _dbContext.Articles.Find(2);
            Assert.That(updatedArticle, Is.Not.EqualTo(dbArticle));
        }

        [Test]
        public async Task UpdateArticle_ArticleDoesntExist_NotFound()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.SaveChanges();

            var updatedArticle = new Article { Id = 2, UserId = 1, Title = "Title2", Image = "Image2" };
            var response = await _articleController.UpdateArticle(2, updatedArticle);

            Assert.That(response, Is.TypeOf<NotFoundResult>());
            var dbArticle = _dbContext.Articles.Find(2);
            Assert.That(dbArticle, Is.Null);
        }

        [Test]
        public async Task UpdateArticle_RoundEnded_Conflict()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - 160,
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.Users.Add(new User { Id = 1, LobbyId = 1, Name = "User1" });
            _dbContext.Articles.Add(new Article { Id = 2, UserId = 1, Title = "Title2", Image = "Image2" });
            _dbContext.SaveChanges();

            var existingArticle = _dbContext.Articles.Find(2);
            var updatedArticle = new Article
            {
                Id = existingArticle.Id,
                UserId = existingArticle.UserId,
                Title = existingArticle.Title,
                Image = existingArticle.Image
            };
            updatedArticle.Level++;

            var response = await _articleController.UpdateArticle(2, updatedArticle);

            Assert.That(response, Is.TypeOf<ConflictResult>());
            var dbArticle = _dbContext.Articles.Find(2);
            Assert.That(updatedArticle, Is.Not.EqualTo(dbArticle));
        }

        [Test]
        public async Task DeleteArticle_ValidId_NoContent()
        {
            var response = await _articleController.DeleteArticle(1);

            Assert.That(response, Is.TypeOf<NoContentResult>());
            var dbArticle = _dbContext.Articles.Find(1);
            Assert.That(dbArticle, Is.Null);
        }

        [Test]
        public async Task DeleteArticle_InvalidId_NotFound()
        {
            var response = await _articleController.DeleteArticle(2);

            Assert.That(response, Is.TypeOf<NotFoundResult>());
            var nullDbArticle = _dbContext.Articles.Find(2);
            Assert.That(nullDbArticle, Is.Null);
            var dbArticle = _dbContext.Articles.Find(1);
            Assert.That(dbArticle, Is.Not.Null);
        }
    }
}
