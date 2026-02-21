<<<<<<< HEAD
using System.ComponentModel.DataAnnotations;

namespace OnlyFriends.Models
{
=======
using onlyfriends.Models;

namespace OnlyFriends.Models
{
    public enum EnumJointType
    {
        Private,
        Public,
    }
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
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
<<<<<<< HEAD
        public required string Title { get; set; }
        public string? Info { get; set; }

        public EnumEventType EventType { get; set; }
        public EnumEventStatus EventStatus { get; set; }

        public int Capacity { get; set; }

=======
        public string Title { get; set; } = string.Empty;
        public string Info { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public EnumEventType EventType { get; set; }
        public EnumEventStatus EventStatus { get; set; }
        public EnumJointType JointType { get; set; }

        public int Capacity { get; set; }

        // Upload poster image and save the URL here
        public string? PosterUrl { get; set; }

        // Time
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public string? TimeZone { get; set; } = "Asia/Bangkok";

        // Map pin
         public double? Latitude { get; set; }
        public double? Longitude { get; set; }

>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
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