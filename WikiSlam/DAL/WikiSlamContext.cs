using WikiSlam.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace WikiSlam.DAL
{
    public class WikiSlamContext : DbContext
    {
        public WikiSlamContext(DbContextOptions<WikiSlamContext> options) : base(options)
        {
        }

        public virtual DbSet<Article> Articles { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Lobby> Lobbies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //Ensures lobby codes are unique
            modelBuilder.Entity<Lobby>()
                .HasIndex(l => new { l.Code })
                .IsUnique(true);
        }
    }
}
