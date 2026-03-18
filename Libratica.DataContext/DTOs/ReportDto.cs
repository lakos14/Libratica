using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libratica.DataContext.DTOs
{
    public class ReportDto
    {
        public int Id { get; set; }
        public UserDto Reporter { get; set; } = null!;
        public ListingDto? Listing { get; set; }
        public UserDto? ReportedUser { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}