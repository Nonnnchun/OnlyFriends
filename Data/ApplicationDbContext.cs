using Microsoft.EntityFrameworkCore;
using onlyfriends.Models;

namespace onlyfriends.Data
{
    public class ApplicationDbContext : DbContext 
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) 
            {

            }
        
        // Add all tables here
        public DbSet<User> Users {get; set;}
        public DbSet<Event> Events {get; set;}
        public DbSet<UserEvent> UserEvents {get; set;}
        public DbSet<Category> Categories {get; set;}
    }
}
