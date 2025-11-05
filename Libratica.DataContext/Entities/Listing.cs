using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Libratica.DataContext.Entities
{
    public class Listing
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        [ForeignKey(nameof(BookId))]
        public Book Book { get; set; } = null!;
        public int SellerId { get; set; }
        [ForeignKey(nameof(SellerId))]
        public User Seller { get; set; } = null!;
        [Required]
        [MaxLength(50)]
        public string Condition { get; set; } = string.Empty;
        [MaxLength(1000)]
        public string? ConditionDescription { get; set; }
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        [MaxLength(10)]
        public string Currency { get; set; } = "HUF";
        public int Quantity { get; set; } = 1;
        public bool IsAvailable { get; set; } = true;
        [MaxLength(200)]
        public string? Location { get; set; }
        [MaxLength(2000)]
        public string? Images { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int ViewsCount { get; set; } = 0;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}