using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Libratica.DataContext.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public int BuyerId { get; set; }
        [ForeignKey(nameof(BuyerId))]
        public User Buyer { get; set; } = null!;
        public int SellerId { get; set; }
        [ForeignKey(nameof(SellerId))]
        public User Seller { get; set; } = null!;
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "pending";
        [MaxLength(1000)]
        public string? ShippingAddress { get; set; }
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}