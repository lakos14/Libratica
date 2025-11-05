using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Libratica.DataContext.Entities
{
    public class Book
    {
        public int Id { get; set; }
        [MaxLength(20)]
        public string? ISBN { get; set; }
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [Required]
        [MaxLength(200)]
        public string Author { get; set; } = string.Empty;
        [MaxLength(200)]
        public string? Publisher { get; set; }
        public int? PublicationYear { get; set; }
        [MaxLength(50)]
        public string? Language { get; set; }
        [MaxLength(2000)]
        public string? Description { get; set; }
        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }
        public int? PageCount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<BookCategory> BookCategories { get; set; } = new List<BookCategory>();
        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
    }
}