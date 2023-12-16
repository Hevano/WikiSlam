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
    public class UserControllerTests
    {
        private WikiSlamContext _dbContext;
        private UserController _userController;

        [SetUp]
        public void SetUp()
        {
            _dbContext = Create.MockedDbContextFor<WikiSlamContext>();
            _dbContext.Users.Add(new User { Id = 1, Name = "User", LobbyId = 1 });
            _dbContext.Lobbies.Add(new Lobby
            {
                Id = 1,
                Code = "AAA",
                RoundStartTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RoundDuration = TimeSpan.FromMinutes(2)
            });
            _dbContext.SaveChanges();

            _userController = new UserController(_dbContext);
        }

        [Test]
        public async Task GetUser_ValidId_Success()
        {
            var response = await _userController.GetUser(1);

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Name, Is.EqualTo("User"));
        }

        [Test]
        public async Task GetUser_InvalidId_NotFound()
        {
            var response = await _userController.GetUser(2);

            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task GetAllUsers_DbContainsUsers_ListOfUsers()
        {
            var users = new List<User>
            {
                new User { Id=2, LobbyId=1, Name="User2"},
                new User { Id=3, LobbyId=1, Name="User3"}
            };
            _dbContext.Users.AddRange(users);
            _dbContext.SaveChanges();

            var response = await _userController.GetAllUsers();

            Assert.That(response.Value, Is.Not.Null);
            Assert.That(response.Value.Count(), Is.EqualTo(3));
            users.Add(_dbContext.Users.Find(1));
            Assert.That(response.Value, Is.EquivalentTo(users));
        }

        [Test]
        public async Task GetAllUsers_DbEmpty_NullList()
        {
            _dbContext.Users.Remove(_dbContext.Users.Find(1));
            _dbContext.SaveChanges();

            var response = await _userController.GetAllUsers();

            Assert.That(response.Result, Is.Null);
        }

        [Test]
        public async Task AddUserToLobby_ValidLogin_CreatedAt()
        {
            var response = await _userController.AddUserToLobby(new UserLogin { Code = "AAA", Name = "User2" });

            Assert.That(response.Result, Is.TypeOf<CreatedAtActionResult>());

            var createdAtActionResult = (CreatedAtActionResult)response.Result;
            Assert.That(createdAtActionResult.Value, Is.Not.Null);

            var createdUser = (User)createdAtActionResult.Value;
            Assert.That(createdUser.Name, Is.EqualTo("User2"));

            var dbUserCount = _dbContext.Users.Where(u => u.Name == "User2").Count();
            Assert.That(dbUserCount, Is.EqualTo(1));
        }

        //Test variations of invalid logins using test cases
        [TestCase("User2", "AAAA")]
        [TestCase("User2", "")]
        [TestCase("User2User2User2User2User2User2User2User2User2User2", "AAA")]
        [TestCase("", "AAA")]
        public async Task AddUserToLobby_InvalidLogin_BadRequest(string userName, string code)
        {
            var response = await _userController.AddUserToLobby(new UserLogin { Code = code, Name = userName });

            Assert.That(response.Result, Is.TypeOf<BadRequestResult>());

            var doesNewUserExist = _dbContext.Users.Where(u => u.Name == userName).Any();
            Assert.That(doesNewUserExist, Is.False);
        }

        [Test]
        public async Task AddUserToLobby_NoLobbies_NotFound()
        {
            _dbContext.Lobbies.Remove(_dbContext.Lobbies.Find(1));
            _dbContext.SaveChanges();

            var response = await _userController.AddUserToLobby(new UserLogin { Code = "AAA", Name = "User2" });

            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());

            var doesNewUserExist = _dbContext.Users.Where(u => u.Name == "User2").Any();
            Assert.That(doesNewUserExist, Is.False);
        }

        [Test]
        public async Task AddUserToLobby_InvalidLobby_NotFound()
        {
            var response = await _userController.AddUserToLobby(new UserLogin { Code = "ZZZ", Name = "User2" });

            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());

            var doesNewUserExist = _dbContext.Users.Where(u => u.Name == "User2").Any();
            Assert.That(doesNewUserExist, Is.False);
        }

        [Test]
        public async Task UpdateUser_ValidUpdate_NoContent()
        {
            var user = _dbContext.Users.Find(1);
            user.Name = "NewName";

            var response = await _userController.UpdateUser(1, user);

            Assert.That(response.Result, Is.TypeOf<NoContentResult>());

            var dbUser = _dbContext.Users.Find(1);
            Assert.That(dbUser, Is.EqualTo(user));
        }

        [Test]
        public async Task UpdateUser_IdMismatch_BadRequest()
        {
            var user = _dbContext.Users.Find(1);
            user.Name = "NewName";

            var response = await _userController.UpdateUser(2, user);

            Assert.That(response.Result, Is.TypeOf<BadRequestResult>());
        }

        [Test]
        public async Task UpdateUser_UserDoesntExist_NotFound()
        {
            var user = new User { Id = 3, Name = "User3" };

            var response = await _userController.UpdateUser(3, user);

            Assert.That(response.Result, Is.TypeOf<NotFoundResult>());
        }

        [Test]
        public async Task DeleteUserUser_ValidId_NoContent()
        {
            var response = await _userController.DeleteUser(1);

            Assert.That(response, Is.TypeOf<NoContentResult>());
            var dbUser = _dbContext.Users.Find(1);
            Assert.That(dbUser, Is.Null);
        }

        [Test]
        public async Task DeleteUserUser_ValidId_NotFound()
        {
            var response = await _userController.DeleteUser(2);

            Assert.That(response, Is.TypeOf<NotFoundResult>());
            var dbUser = _dbContext.Users.Find(1);
            Assert.That(dbUser, Is.Not.Null);
        }
    }
}
