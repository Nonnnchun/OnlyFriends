using OnlyFriends.Models;

namespace OnlyFriends.Models.DTOS.UserDTOS
{
    public class GetUserDTO
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public string Bio { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        
        // Removed 'required' to prevent breaking other pages like the Home page
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // Changed to ICollection to support the HashSet returned by EF
        public ICollection<int> EventIds { get; set; } = new List<int>();

        // Changed to ICollection to fix the InvalidCastException on the Home page
        public ICollection<OnlyFriends.Models.Event> CreatedEvents { get; set; } = new List<OnlyFriends.Models.Event>();
    }
}