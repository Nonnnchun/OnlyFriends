<<<<<<< HEAD
<<<<<<< HEAD
using System.ComponentModel.DataAnnotations;

namespace OnlyFriends.Models
{
=======
using onlyfriends.Models;
=======
using OnlyFriends.Models;
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5

namespace OnlyFriends.Models
{
    public enum EnumJointType
    {
        Private,
        Public,
    }
<<<<<<< HEAD
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
=======
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
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
<<<<<<< HEAD
        public required string Title { get; set; }
        public string? Info { get; set; }

        public EnumEventType EventType { get; set; }
        public EnumEventStatus EventStatus { get; set; }

        public int Capacity { get; set; }

=======
=======
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
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

<<<<<<< HEAD
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
=======
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
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