using OnlyFriends.Models;

namespace OnlyFriends.Models
{
    public enum EnumJointType
    {
        Private,
        Public,
    }
    public enum EnumEventStatus
    {
        Open,
        Closed,
    }
    public enum EnumEventType
    {
        Online,
        Offline
    }

    public class Event
    {
        public int Id { get; set; }
        public required string Title { get; set; } = string.Empty;
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
        public DateTime? RegistrationDeadline { get; set; }
        public string? TimeZone { get; set; } 

        // Map pin
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public required int OwnerId { get; set; } 
        public required User Owner { get; set; } 

        // Participants
        public List<User> Users { get; } = [];
        public List<UserEvent> UserEvents { get; } = [];

        // Categories
        public List<Category> Categories { get; set; } = new List<Category>(); 
    }
}