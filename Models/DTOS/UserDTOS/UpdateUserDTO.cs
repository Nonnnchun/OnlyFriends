using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlyFriends.Models.DTOS.UserDTOS
{
    public class UpdateUserDTO
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Bio { get; set; }
        
        // Add this to handle the uploaded file
        public IFormFile? ProfilePicture { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}