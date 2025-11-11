using Microsoft.EntityFrameworkCore;
using SimpleFullStackApp.Models;
namespace SimpleFullStackApp.Data
{
    public class ApiDBContext : DbContext
    {
        public DbSet<Product> Products { get; set; }
        public DbSet<StockMovement> StockMovement { get; set; }
        public DbSet<User> Users { get; set; }

        public ApiDBContext(DbContextOptions<ApiDBContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>().HasIndex(p => p.SKU).IsUnique();
        }
    }
}
