using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // เพิ่มบรรทัดนี้

namespace onlyfriends.Models
{
    public enum EnumEventStatus
    {
        Open,
        Closed,
    }
    public enum EnumEventType
    {
        Online,
        Offline
    }

    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Info { get; set; }

        // ✅ 1. เพิ่มวันเวลา (แทน DateText และ Time เดิม)
        public DateTime EventDate { get; set; } 

        // ✅ 2. เพิ่มสถานที่ (แทน Location เดิม)
        public string Location { get; set; }

        // ✅ 3. เพิ่มรูปภาพ (แทน ImageUrl เดิม)
        public string ImageUrl { get; set; }

        public EnumEventType EventType { get; set; }
        public EnumEventStatus EventStatus { get; set; }

        public int Capacity { get; set; }

        public int OwnerId { get; set; }
        public User Owner { get; set; } = null!;

        // Participants
        public List<User> Users { get; } = [];
        public List<UserEvent> UserEvents { get; } = [];

        // Category
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        
        // ✅ 4. (Option) สร้าง Helper ไว้นับคน (จะได้ไม่ต้องแก้ View เยอะ)
        [NotMapped]
        public int ParticipantCount => UserEvents?.Count ?? 0;
    }
}