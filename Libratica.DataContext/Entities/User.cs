using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace Libratica.DataContext.Entities
{
    public class User
    {
        public int Id { get; set; }
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        [MaxLength(100)]
        public string? FullName { get; set; }
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        [MaxLength(500)]
        public string? ProfilePictureUrl { get; set; }
        [MaxLength(1000)]
        public string? Bio { get; set; }
        [MaxLength(500)]
        public string? Address { get; set; }
        public int RoleId { get; set; }
        [ForeignKey(nameof(RoleId))]
        public Role Role { get; set; } = null!;
        public bool IsVerified { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime? BannedUntil { get; set; }
        [MaxLength(500)]
        public string? BannedReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        [Column(TypeName = "decimal(3,2)")]
        public decimal? Rating { get; set; }
        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
        public ICollection<Order> OrdersAsBuyer { get; set; } = new List<Order>();
        public ICollection<Order> OrdersAsSeller { get; set; } = new List<Order>();
        public ICollection<Review> ReviewsWritten { get; set; } = new List<Review>();
        public ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    }
}