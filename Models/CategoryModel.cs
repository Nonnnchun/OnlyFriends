
using OnlyFriends.Models;

namespace OnlyFriends.Models
{

    public class Category
    {
        public int Id { get; set; }

        public required string CategoryName { get; set; }
        public ICollection<Event> Events { get; } = new List<Event>();
    }

}