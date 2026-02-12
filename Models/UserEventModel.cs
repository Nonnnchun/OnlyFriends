namespace onlyfriends.Models
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

        public EnumRequestStatus RequestStatus { get; set; }

    }

}