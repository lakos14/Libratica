using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Tracing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libratica.DataContext.Entities
{
    public class Event
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required]
        public DateTime EventDate { get; set; }

        [Required]
        [MaxLength(300)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Status { get; set; } = "pending";

        public int OrganizerId { get; set; }
        [ForeignKey(nameof(OrganizerId))]
        public User Organizer { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
        public ICollection<EventComment> Comments { get; set; } = new List<EventComment>();
    }
}