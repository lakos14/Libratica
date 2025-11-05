using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Libratica.DataContext.Entities
{
    public class Review
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        [ForeignKey(nameof(OrderId))]
        public Order Order { get; set; } = null!;
        public int ReviewerId { get; set; }
        [ForeignKey(nameof(ReviewerId))]
        public User Reviewer { get; set; } = null!;
        public int ReviewedUserId { get; set; }
        [ForeignKey(nameof(ReviewedUserId))]
        public User ReviewedUser { get; set; } = null!;
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        [MaxLength(1000)]
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}