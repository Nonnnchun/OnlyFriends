namespace OnlyFriends.Models.DTOS.UserDTOS
{
    public class GetUserDTO
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Bio { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}