using OnlyFriends.Models.DTOS.EventDTOS;

namespace OnlyFriends.Models.ViewModels
{
    public class HomepageViewModel
    {
        public IEnumerable<GetEventDTO> AllEvents { get; set; } = [];
        public IEnumerable<GetEventDTO> JoinedEvents { get; set; } = [];
        public string ActiveTab { get; set; } = "all";
        public List<int> SelectedCategoryIds { get; set; } = [];
        public string SelectedCategoryIdsQuery => string.Join(",", SelectedCategoryIds);
    }
}
