using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class AddUserToEventDTO
    {
        public required int UserId { get; set; }
        public required int EventId { get; set; }
    }
}