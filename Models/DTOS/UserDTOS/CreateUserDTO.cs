
using System.ComponentModel.DataAnnotations;


namespace OnlyFriends.Models.DTOS.UserDTOS
{
    public class CreateUserDTO
    {
        [Required]
        public required string Username { get; set; }
        [Required]
        public required string Email { get; set; }
        [Required]
        public required string Password { get; set; }


    }
}