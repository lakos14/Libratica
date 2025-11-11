using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libratica.DataContext.DTOs
{
    public class ListingDto
    {
        public int Id { get; set; }
        public BookDto Book { get; set; } = null!;
        public UserDto Seller { get; set; } = null!;
        public string Condition { get; set; } = string.Empty;
        public string? ConditionDescription { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public bool IsAvailable { get; set; }
        public string? Location { get; set; }
        public List<string> Images { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int ViewsCount { get; set; }
    }
}
