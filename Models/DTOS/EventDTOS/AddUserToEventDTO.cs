using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration.UserSecrets;
using OnlyFriends.Models;


namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class AddUserToEventDTO
    {
        public required int UserId { get; set; }
        public required int EventId { get; set; }
        public EnumRequestStatus? RequestStatus {get; set;}
    }
}