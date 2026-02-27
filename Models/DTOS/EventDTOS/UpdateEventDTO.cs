using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class UpdateEventDTO
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string? Title { get; set; }
        public string? Info { get; set; }
        public string? PosterUrl { get; set; }
        public string? Location { get; set; }
        public EnumEventType? EventType { get; set; }
        public EnumEventStatus? EventStatus { get; set; }
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public int? Capacity { get; set; }

    }
}