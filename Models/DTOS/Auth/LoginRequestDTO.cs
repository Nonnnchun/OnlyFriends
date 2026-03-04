namespace OnlyFriends.Models.DTOs.Auth
{
    public class LoginRequestDTO
    {
        public string? Identifier { get; set; }
        public string? Email { get; set; }
        public string Password { get; set; } = null!;
    }
}
