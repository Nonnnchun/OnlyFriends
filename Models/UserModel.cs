<<<<<<< HEAD
<<<<<<< HEAD
namespace OnlyFriends.Models
=======
using OnlyFriends.Models;

namespace onlyfriends.Models
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
=======
using OnlyFriends.Models;

namespace OnlyFriends.Models
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
{
    public class User
    {
        public int Id { get; set; }
<<<<<<< HEAD
<<<<<<< HEAD
        public required string Username { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Bio { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
=======
=======
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public string Bio { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
<<<<<<< HEAD
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
=======
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
        public ICollection<Event> CreatedEvents { get; } = new List<Event>();

        public List<Event> Events { get; } = [];
        public List<UserEvent> UserEvents { get; } = [];
    }

}