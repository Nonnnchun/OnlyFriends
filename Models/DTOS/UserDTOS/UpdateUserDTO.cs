using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace onlyfriends.Models.DTOS.UserDTOS
{
    public class UpdateUserDTO
    {
        public int Id { get; set; }

        public string? Username { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Bio { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}