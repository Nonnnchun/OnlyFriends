using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class UpdateEventDTO
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Info { get; set; }

        public EnumEventType? EventType { get; set; }
        public EnumEventStatus? EventStatus { get; set; }

        public int? Capacity { get; set; }
    }
}