using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Libratica.DataContext.Entities
{
    public class Report
    {
        public int Id { get; set; }

        public int ReporterId { get; set; }
        [ForeignKey(nameof(ReporterId))]
        public User Reporter { get; set; } = null!;

        public int? ListingId { get; set; }
        [ForeignKey(nameof(ListingId))]
        public Listing? Listing { get; set; }

        public int? ReportedUserId { get; set; }
        [ForeignKey(nameof(ReportedUserId))]
        public User? ReportedUser { get; set; }

        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Status { get; set; } = "pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}