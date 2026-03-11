
namespace OnlyFriends.Models
{
    public enum EnumRequestStatus
    {
        Pending,
        Rejected,
        Accepted,
    }
    // Keeps the status of the event that the user requested
    public class UserEvent
    {
        public int UserId { get; set; }
        public int EventId { get; set; }
        public User User { get; set; } = null!;
        public Event Event { get; set; } = null!;
        public EnumRequestStatus RequestStatus { get; set;}
        public DateTime RegisteredAt {get; set;} = DateTime.UtcNow;
    }

}