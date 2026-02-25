using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace OnlyFriends.Models.DTOS.EventDTOS
{
    // public class CreateEventDTO
    // {
    //     public required string Title { get; set; }
    //     public string? Info { get; set; }
        
    //     public required string Location { get; set; } 
    //     public int CategoryId { get; set; }

    //     public EnumJointType JointType { get; set; }
    //     public EnumEventType EventType { get; set; }

    //     public double? Latitude { get; set; }
    //     public double? Longitude { get; set; }
    //     public IFormFile? PosterImage { get; set; }

    //     public int Capacity { get; set; }
    //     public int OwnerId { get; set; } // เก็บไว้เทสต์ก่อนได้ครับ
    // }
      public class CreateEventDTO
    {
        public required string Title { get; set; }
        public string? Info { get; set; }
        public string? PosterUrl { get; set; }
        public required EnumEventType EventType { get; set; }
        public required EnumEventStatus EventStatus { get; set; }
        public required EnumJointType JointType { get; set; }
        public required double? Latitude { get; set; }
        public required double? Longitude { get; set; }
        public required string Location { get; set; }
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public string? TimeZone { get; set; }
        public required int Capacity { get; set; }
        public required int OwnerId { get; set; }
        public required int CategoryId { get; set; } // Required foreign key property

    }
}