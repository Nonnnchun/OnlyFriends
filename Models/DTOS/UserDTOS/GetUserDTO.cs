using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace onlyfriends.Models.DTO
{
    public class GetUserDTO
    {
        [Required]
        public required string Username {get; set;}  
        [Required]
        public required string Email {get; set;}  
        [Required]
        public required string Password {get; set;}  

        public static User ToUser(GetUserDTO getUserDTO)
        {
            return new User
            {
                Username = getUserDTO.Username,
                Email = getUserDTO.Email,
                Password = getUserDTO.Password,
            };
        }

    }
}