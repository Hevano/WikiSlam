﻿using WikiSlam.Models;
using System.Data.Entity.ModelConfiguration.Conventions;
using Microsoft.EntityFrameworkCore;

namespace WikiSlam.DAL
{
    public class WikiSlamContext : DbContext
    {
        public WikiSlamContext(DbContextOptions<WikiSlamContext> options) : base(options)
        {
        }

        public DbSet<Article> Articles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Lobby> Lobbies { get; set; }
    }
}
