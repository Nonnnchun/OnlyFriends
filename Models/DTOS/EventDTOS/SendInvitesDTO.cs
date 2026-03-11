namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class SendInvitesDTO
    {
        public int EventId { get; set; }
        public List<int> UserIds { get; set; } = [];
        public string Message { get; set; } = "";
    }
}
