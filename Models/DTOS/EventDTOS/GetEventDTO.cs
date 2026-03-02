using OnlyFriends.Models.DTOS.CategoryDTOS;
using OnlyFriends.Models.DTOS.UserDTOS;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class GetEventDTO
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string Info { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public required EnumEventType EventType { get; set; }
        public required EnumEventStatus EventStatus { get; set; }
        public required EnumJointType JointType { get; set; }
        public required int Capacity { get; set; }

        // Upload poster image and save the URL here
        public string? PosterUrl { get; set; }
        // Time
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public string? TimeZone { get; set; }
        // Map pin
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<User> Users { get; set; } = [];
        public List<UserEvent> UserEvents { get; set; } = [];
        public required GetUserDTO Owner { get; set; }
        public required GetCategoryDTO Category { get; set; }

    }
}