
using OnlyFriends.Models;

namespace OnlyFriends.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public string Bio { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public required string Email { get; set; }
        public required string Password { get; set; }
        public ICollection<Event> CreatedEvents { get; } = new List<Event>();

        public List<Event> Events { get; } = [];
        public List<UserEvent> UserEvents { get; } = [];
    }

}