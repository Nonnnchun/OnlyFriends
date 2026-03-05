namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class UpdateParticipantStatusDTO
    {
        public int EventId { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; } = "";
    }
}
