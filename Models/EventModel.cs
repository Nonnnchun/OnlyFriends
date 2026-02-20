using System.ComponentModel.DataAnnotations;

namespace OnlyFriends.Models
{
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
        public required string Title { get; set; }
        public string? Info { get; set; }

        public EnumEventType EventType { get; set; }
        public EnumEventStatus EventStatus { get; set; }

        public int Capacity { get; set; }

        public int OwnerId { get; set; }
        public User Owner { get; set; } = null!;

        // Participants
        public List<User> Users { get; } = [];
        public List<UserEvent> UserEvents { get; } = [];

        // Category
        public int CategoryId { get; set; } // Required foreign key property
        public Category Category { get; set; } = null!; // Required reference navigation to principal 
    }

}