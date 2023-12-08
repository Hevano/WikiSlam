using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WikiSlam.Models;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.Data.Entity;

/*namespace WikiSlam.DAL
{
    public class WikiSlamInitializer : DropCreateDatabaseIfModelChanges<WikiSlamContext>
    {
        protected override void Seed(WikiSlamContext context)
        {
            var Lobbies = new List<Lobby>
            {
            new Lobby{Id=1, Code="AAAA", CreationTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(), RoundDuration = new TimeSpan(0,3,0)},
            };
            Lobbies.ForEach(s => context.Lobbies.Add(s));
            context.SaveChanges();

            var Users = new List<User>
            {
            new User{Id=1, Name="Caveman Ugg", LobbyId=1, IsAdmin=true},
            };

            Users.ForEach(s => context.Users.Add(s));
            context.SaveChanges();
            var Articles = new List<Article>
            {
            new Article{Id=1, UserId=1, Title="Troglodyte (disambiguation)", Strength=1, Dexterity=1, Willpower=1},
            };
            Articles.ForEach(s => context.Articles.Add(s));
            context.SaveChanges();

        }
    }
}*/
