using Microsoft.EntityFrameworkCore;
using OnlyFriends.Models;

namespace OnlyFriends.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {

        }

        // Add all tables here
        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<UserEvent> UserEvents { get; set; }
        public DbSet<Category> Categories { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Owner)
                .WithMany(u => u.CreatedEvents)
                .HasForeignKey(e => e.OwnerId);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Events)
                .WithMany(e => e.Users)
                .UsingEntity<UserEvent>();
        }
    }

}
