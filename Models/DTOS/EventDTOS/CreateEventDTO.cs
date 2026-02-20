using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class CreateEventDTO
    {
        public required string Title { get; set; }
        public string? Info { get; set; }

        public EnumEventType EventType { get; set; }
        public EnumEventStatus EventStatus { get; set; }

        public int Capacity { get; set; }
    }
}