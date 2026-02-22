using Microsoft.EntityFrameworkCore;
using PersonalBudgetApp.Models;

namespace PersonalBudgetApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Transaction> Transactions { get; set; }
    }
}