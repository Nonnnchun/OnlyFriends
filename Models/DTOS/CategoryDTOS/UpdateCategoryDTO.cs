using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlyFriends.Models.DTOS.CategoryDTOS
{
    public class UpdateCategoryDTO
    {
        public int Id { get; set; }

        public required string CategoryName { get; set; }

    }
}