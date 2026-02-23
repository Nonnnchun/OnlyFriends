
using System.ComponentModel.DataAnnotations;


namespace OnlyFriends.Models.DTOS.UserDTOS
{
    public class CreateUserDTO
    {
        public required string Username { get; set; }
        public required string FirstName { get; set; } 
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string Bio { get; set; } = string.Empty;
    }
}