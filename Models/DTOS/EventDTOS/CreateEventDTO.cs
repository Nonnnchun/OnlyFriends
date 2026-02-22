using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlyFriends.Models.DTOS.EventDTOS
{
    // TODO: Read this tutorial for Many to many relationship CRUD 
    // https://medium.com/@promiseadeagbo/many-to-many-relationship-in-asp-net-core-5e8335fadb90
    public class CreateEventDTO
    {
        public required string Title { get; set; }
        public string? Info { get; set; }

        public required EnumEventType EventType { get; set; }
        public required EnumEventStatus EventStatus { get; set; }
        public required EnumJointType JointType { get; set; }

        public required int Capacity { get; set; }

        public required int OwnerId { get; set; }
        public required int CategoryId { get; set; } // Required foreign key property

    }
}