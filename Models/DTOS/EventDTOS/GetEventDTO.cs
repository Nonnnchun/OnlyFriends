using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    public class GetEventDTO
    {
        public int Id { get; set; }
        public required string Title { get; set; }
    }
}