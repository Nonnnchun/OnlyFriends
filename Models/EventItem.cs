namespace onlyfriends.Models // เช็คชื่อ namespace ให้ตรงกับโปรเจกต์คุณ
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

    public class EventItem
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Info { get; set; }

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