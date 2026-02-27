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

// เขียนกัน error เฉยๆ merge branch siwakorn
    public enum EnumJointType
    {
        Invited,
        Register,
    }

    public class Event
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Info { get; set; }

        public EnumEventType EventType { get; set; }
        public EnumEventStatus EventStatus { get; set; }
        public EnumJointType JointType{get; set;}
        public int Capacity { get; set; }

        public int OwnerId { get; set; }
        public User Owner { get; set; } = null!;

        // Participants
        public List<User> Users { get; } = [];
        public List<UserEvent> UserEvents { get; } = [];

        // Category
        public required int CategoryId { get; set; } // Required foreign key property
        public required Category Category { get; set; } // Required reference navigation to principal 
    }

}