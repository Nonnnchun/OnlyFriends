using Notifications.Models;
using Microsoft.EntityFrameworkCore;

namespace OnlyFriends.Data
{
      public class ApplicationDbContext : DbContext
   {
      public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
      {
      }
      public DbSet<Notification> Notifications { get; set; }
   }
}

