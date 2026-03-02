using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OnlyFriends.Models.DTOS.CategoryDTOS;
using OnlyFriends.Models.DTOS.UserDTOS;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class UpdateEventDTO
    {
        public int? Id { get; set; }
        public string? Title { get; set; }
        public string? Info { get; set; }
        public string? Location { get; set; }
        public EnumEventType? EventType { get; set; }
        public EnumEventStatus? EventStatus { get; set; }
        public EnumJointType? JointType { get; set; }
        public int? Capacity { get; set; }

        // Upload poster image and save the URL here
        public string? PosterUrl { get; set; }
        // Time
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public string? TimeZone { get; set; }
        // Map pin
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<User>? Users { get; set; } = [];
        public List<UserEvent>? UserEvents { get; set; } = [];
        public GetUserDTO? Owner { get; set; }
        public GetCategoryDTO? Category { get; set; }

    }
}