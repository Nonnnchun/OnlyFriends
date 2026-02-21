using System.ComponentModel.DataAnnotations;


namespace OnlyFriends.Models.DTOS.UserDTOS
{
    public class GetUserDTO
    {
        public int Id { get; set; }
        [Required]
        public required string Username { get; set; }
        public string LastName { get; set; } = string.Empty;
        public required string Email { get; set; }
        public required string Password { get; set; }

    }
}