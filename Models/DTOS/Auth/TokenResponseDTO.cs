namespace OnlyFriends.Models.DTOs.Auth
{
    public class TokenResponseDTO
    {
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
