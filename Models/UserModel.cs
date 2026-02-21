<<<<<<< HEAD
namespace OnlyFriends.Models
=======
using OnlyFriends.Models;

namespace onlyfriends.Models
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
{
    public class User
    {
        public int Id { get; set; }
<<<<<<< HEAD
        public required string Username { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Bio { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
=======
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public string Bio { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
        public ICollection<Event> CreatedEvents { get; } = new List<Event>();

        public List<Event> Events { get; } = [];
        public List<UserEvent> UserEvents { get; } = [];
    }

}