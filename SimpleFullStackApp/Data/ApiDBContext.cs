using Microsoft.EntityFrameworkCore;
using SimpleFullStackApp.Models;
using System.Data;

namespace SimpleFullStackApp.Data
{
    public class ApiDBContext: DbContext
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<StockMovement> StockMovement { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Server=(localdb)\MSSQLLocalDB;DataBase=StockMovement");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>().HasIndex(p => p.SKU).IsUnique();
        }
    }
}
