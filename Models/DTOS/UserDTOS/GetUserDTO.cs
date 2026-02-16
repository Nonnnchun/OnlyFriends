using System.ComponentModel.DataAnnotations;


namespace onlyfriends.Models.DTO.UserDTOS
{
    public class GetUserDTO
    {
        [Required]
        public required string Username {get; set;}  

    }
}