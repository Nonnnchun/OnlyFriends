namespace onlyfriends.Models
{

    public class Category
    {
        public int Id { get; set; }
        public string CategoryName { get; set; }
        public ICollection<Event> Events { get; } = new List<Event>();
    }

}