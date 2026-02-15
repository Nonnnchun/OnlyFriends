using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace onlyfriends.Models.DTO
{
    public class CreateUserDTO
    {
        [Required]
        public required string Username {get; set;}  
        [Required]
        public required string Email {get; set;}  
        [Required]
        public required string Password {get; set;}  

        public static User ToUser(CreateUserDTO createUserDTO)
        {
            return new User
            {
                Username = createUserDTO.Username,
                Email = createUserDTO.Email,
                Password = createUserDTO.Password,
            };
        }

    }
}