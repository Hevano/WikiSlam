using EntityFrameworkCore.Testing.Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NUnit.Framework;
using WikiSlam.Controllers;
using WikiSlam.DAL;
using WikiSlam.Models;

namespace WikiSlamTest
{
    [TestFixture]
    public class LobbyControllerTests
    {
        private WikiSlamContext _dbContext;
        private LobbyController _lobbyController;

        [SetUp]
        public void SetUp()
        {
            _dbContext = Create.MockedDbContextFor<WikiSlamContext>();
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "aaa",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.SaveChanges();

            _lobbyController = new LobbyController(_dbContext);
        }


        [Test]
        public async Task GetLobby_ValidId_Success()
        {
            var response = await _lobbyController.GetLobby(1);

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Code, Is.EqualTo("aaa"));
        }

        [Test]
        public async Task GetLobby_InvalidId_Null()
        {
            var response = await _lobbyController.GetLobby(2);

            Assert.That(response.Value, Is.Null);
        }

        [Test]
        public async Task GetLobbies_DbEmpty_NullList()
        {
            _dbContext.Lobbies.Remove(_dbContext.Lobbies.Find(1));
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbies();
            Assert.That(response.Value, Is.Null);
        }

        [Test]
        public async Task GetLobbies_DbContainsLobbies_ListOfLobbies()
        {
            var lobbies = new List<Lobby>
            {
                new Lobby
                {
                    Id = 2,
                    Code = "bbb",
                    RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    RoundDuration = TimeSpan.FromMinutes(2)
                },
                new Lobby
                {
                    Id = 3,
                    Code = "ccc",
                    RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    RoundDuration = TimeSpan.FromMinutes(2)
                },
            };
            _dbContext.Lobbies.AddRange(lobbies);
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbies();

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Count(), Is.EqualTo(3));
            lobbies.Add(_dbContext.Lobbies.Find(1));
            Assert.That(response.Value, Is.EquivalentTo(lobbies));

        }

        [Test]
        public async Task GetLobbyResults_ThreeArticles_CorrectResults()
        {
            //Create a lobby where the round has already ended
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 2,
                Code = "bbb",
                RoundStartTimestamp = 0
            });

            var users = new List<User>
            {
                new User { Id=1, LobbyId=2, Name="User1"},
                new User { Id=2, LobbyId=2, Name="User2"},
                new User { Id=3, LobbyId=2, Name="User3"}
            };
            _dbContext.Users.AddRange(users);

            var articles = new List<Article>
            {
                new Article { Id=1, Image="Image1", Title="Title1", UserId=1, Dexterity=100, Strength=100, Willpower=100 },
                new Article { Id=2, Image="Image2", Title="Title2", UserId=2, Dexterity=10, Strength=10, Willpower=10 },
                new Article { Id=3, Image="Image3", Title="Title3", UserId=3, Dexterity=1, Strength=1, Willpower=1 },
            };
            
            _dbContext.Articles.AddRange(articles);
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbyResults(2);

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Winner, Is.EqualTo(1));
            Assert.That(response.Value.resultsList.Count(), Is.EqualTo(3));
            Assert.That(response.Value.resultsList[0].Article, Is.EqualTo(articles[0]));
            Assert.That(response.Value.resultsList[1].Article, Is.EqualTo(articles[1]));
            Assert.That(response.Value.resultsList[2].Article, Is.EqualTo(articles[2]));
        }

        [Test]
        public async Task GetLobbyResults_OneArticle_CorrectResults()
        {
            //Create a lobby where the round has already ended
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 2,
                Code = "bbb",
                RoundStartTimestamp = 0
            });

            var users = new List<User>
            {
                new User { Id=1, LobbyId=2, Name="User1"}
            };
            _dbContext.Users.AddRange(users);

            var articles = new List<Article>
            {
                new Article { Id=1, Image="Image1", Title="Title1", UserId=1, Dexterity=100, Strength=100, Willpower=100 }
            };

            _dbContext.Articles.AddRange(articles);
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbyResults(2);

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Winner, Is.EqualTo(1));
            Assert.That(response.Value.resultsList.Count(), Is.EqualTo(1));
            Assert.That(response.Value.resultsList[0].Article, Is.EqualTo(articles[0]));
        }

        [Test]
        public async Task GetLobbyResults_NoArticles_CorrectResults()
        {
            //Create a lobby where the round has already ended
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 2,
                Code = "bbb",
                RoundStartTimestamp = 0
            });
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbyResults(2);

            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task GetLobbyResults_RoundNotEnded_Conflict()
        {
            var response = await _lobbyController.GetLobbyResults(1);

            Assert.That(response.Result, Is.TypeOf<ConflictResult>());
        }

        [Test]
        public async Task GetLobbyArticles_ThreeArticles_Success()
        {
            var users = new List<User>
            {
                new User { Id=1, LobbyId=1, Name="User1"},
                new User { Id=2, LobbyId=1, Name="User2"},
                new User { Id=3, LobbyId=1, Name="User3"}
            };
            _dbContext.Users.AddRange(users);

            var articles = new List<Article>
            {
                new Article { Id=1, Image="Image1", Title="Title1", UserId=1, Dexterity=100, Strength=100, Willpower=100 },
                new Article { Id=2, Image="Image2", Title="Title2", UserId=2, Dexterity=10, Strength=10, Willpower=10 },
                new Article { Id=3, Image="Image3", Title="Title3", UserId=3, Dexterity=1, Strength=1, Willpower=1 },
            };

            _dbContext.Articles.AddRange(articles);
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbyArticles(1);

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Count(), Is.EqualTo(3));
            Assert.That(response.Value, Is.EquivalentTo(articles));
        }

        [Test]
        public async Task GetLobbyArticles_MultipleLobbies_Success()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 2,
                Code = "bbb",
                RoundStartTimestamp = 0
            });

            var users = new List<User>
            {
                new User { Id=1, LobbyId=1, Name="User1"},
                new User { Id=2, LobbyId=1, Name="User2"},
                new User { Id=3, LobbyId=2, Name="User3"}
            };
            _dbContext.Users.AddRange(users);

            var articles = new List<Article>
            {
                new Article { Id=1, Image="Image1", Title="Title1", UserId=1, Dexterity=100, Strength=100, Willpower=100 },
                new Article { Id=2, Image="Image2", Title="Title2", UserId=2, Dexterity=10, Strength=10, Willpower=10 },
                new Article { Id=3, Image="Image3", Title="Title3", UserId=3, Dexterity=1, Strength=1, Willpower=1 },
            };

            _dbContext.Articles.AddRange(articles);
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbyArticles(1);

            articles.Remove(articles.Last());

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Count(), Is.EqualTo(2));
            Assert.That(response.Value, Is.EquivalentTo(articles));
        }

        [Test]
        public async Task GetLobbyArticles_NoArticlesInLobby_Null()
        {
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 2,
                Code = "bbb",
                RoundStartTimestamp = 0
            });

            var users = new List<User>
            {
                new User { Id=1, LobbyId=1, Name="User1"},
                new User { Id=2, LobbyId=1, Name="User2"},
                new User { Id=3, LobbyId=1, Name="User3"}
            };
            _dbContext.Users.AddRange(users);

            var articles = new List<Article>
            {
                new Article { Id=1, Image="Image1", Title="Title1", UserId=1, Dexterity=100, Strength=100, Willpower=100 },
                new Article { Id=2, Image="Image2", Title="Title2", UserId=2, Dexterity=10, Strength=10, Willpower=10 },
                new Article { Id=3, Image="Image3", Title="Title3", UserId=3, Dexterity=1, Strength=1, Willpower=1 },
            };

            _dbContext.Articles.AddRange(articles);
            _dbContext.SaveChanges();

            var response = await _lobbyController.GetLobbyArticles(2);

            Assert.That(response.Value.IsNullOrEmpty());
        }

        [Test]
        public async Task GetLobbyArticles_NoArticles_Null()
        {
            var response = await _lobbyController.GetLobbyArticles(1);

            Assert.That(response.Value.IsNullOrEmpty());
        }

        [Test]
        public async Task GetLobbyArticles_InvalidLobbyId_NotFound()
        {
            var response = await _lobbyController.GetLobbyArticles(100);

            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task CreateLobby_ValidName_Success()
        {
            var response = await _lobbyController.CreateLobby(new AdminLogin { Name = "ValidName" });

            

            Assert.That(response.Result, Is.Not.Null);
            Assert.That(response.Result, Is.TypeOf<CreatedAtActionResult>());

            var responseValue = (LobbyCreationResponse)((CreatedAtActionResult)response.Result).Value;

            Assert.That(responseValue.Admin.IsAdmin);
            Assert.That(responseValue.Admin.Name, Is.EqualTo("ValidName"));
            Assert.That(responseValue.Lobby, Is.Not.Null);

        }

        [TestCase("")]
        [TestCase("ReallyLongNameThatShouldntBeTreatedAsValid")]
        public async Task CreateLobby_InvalidName_BadRequest(string name)
        {
            var response = await _lobbyController.CreateLobby(new AdminLogin { Name = name });



            Assert.That(response.Result, Is.Not.Null);
            Assert.That(response.Result, Is.TypeOf<BadRequestResult>());
            Assert.That(_dbContext.Lobbies.Count(), Is.EqualTo(1));
            Assert.That(_dbContext.Users.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task UpdateLobby_ArticleExists_NoContent()
        {
            var oldLobby = _dbContext.Lobbies.Find(1);
            oldLobby.CreationTimestamp = 12345;

            var response = await _lobbyController.UpdateLobby(1, oldLobby);

            Assert.That(response.Result, Is.Not.Null);
            Assert.That(response.Result, Is.TypeOf<NoContentResult>());

            var newLobby = _dbContext.Lobbies.Find(1);
            Assert.That(newLobby.CreationTimestamp, Is.EqualTo(oldLobby.CreationTimestamp));
        }

        [Test]
        public async Task UpdateLobby_IdMismatch_BadRequest()
        {
            var oldLobby = _dbContext.Lobbies.Find(1);
            oldLobby.CreationTimestamp = 12345;

            var response = await _lobbyController.UpdateLobby(2, oldLobby);

            Assert.That(response.Result, Is.Not.Null);
            Assert.That(response.Result, Is.TypeOf<BadRequestResult>());
        }

        [Test]
        public async Task UpdateLobby_InvalidId_NotFound()
        {
            var response = await _lobbyController.UpdateLobby(3, new Lobby { Code="ccc", Id=3});

            Assert.That(response.Result, Is.Not.Null);
            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task DeleteLobby_LobbyExists_NoContent()
        {
            var response = await _lobbyController.DeleteLobby(1);

            Assert.That(response, Is.Not.Null);
            Assert.That(response, Is.TypeOf<NoContentResult>());
            Assert.That(_dbContext.Lobbies.Find(1), Is.Null);
        }

        [Test]
        public async Task DeleteLobby_NoLobbiesExist_NotFound()
        {
            _dbContext.Lobbies.Remove(_dbContext.Lobbies.Find(1));
            _dbContext.SaveChanges();

            var response = await _lobbyController.DeleteLobby(1);

            Assert.That(response, Is.Not.Null);
            Assert.That(response, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task DeleteLobby_InvalidId_NotFound()
        {
            var response = await _lobbyController.DeleteLobby(2);

            Assert.That(response, Is.Not.Null);
            Assert.That(response, Is.TypeOf<NotFoundResult>());
        }
    }
}
