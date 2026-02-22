using System.ComponentModel.DataAnnotations;


namespace OnlyFriends.Models.DTOS.UserDTOS
{
    public class GetUserDTO
    {
        public int Id { get; set; }
        [Required]
        public required string Username { get; set; }

    }
}