<<<<<<< HEAD
<<<<<<< HEAD
namespace OnlyFriends.Models
=======
using OnlyFriends.Models;

namespace onlyfriends.Models
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
=======
using OnlyFriends.Models;

namespace OnlyFriends.Models
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
{

    public class Category
    {
        public int Id { get; set; }
<<<<<<< HEAD
<<<<<<< HEAD
        public required string CategoryName { get; set; }
=======
        public string? CategoryName { get; set; }
>>>>>>> 0aafc029e194eeca62a9dd9a0ba2c8754c63c2ad
=======
        public string? CategoryName { get; set; }
>>>>>>> 8f540135cd985b7bc22c41ea0f3c65d857bea1d5
        public ICollection<Event> Events { get; } = new List<Event>();
    }

}