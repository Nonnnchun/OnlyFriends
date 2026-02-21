<<<<<<< HEAD
namespace OnlyFriends.Models
=======
using OnlyFriends.Models;

namespace onlyfriends.Models
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
{

    public class Category
    {
        public int Id { get; set; }
<<<<<<< HEAD
        public required string CategoryName { get; set; }
=======
        public string? CategoryName { get; set; }
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
        public ICollection<Event> Events { get; } = new List<Event>();
    }

}