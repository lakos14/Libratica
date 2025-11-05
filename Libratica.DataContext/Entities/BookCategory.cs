using System.ComponentModel.DataAnnotations.Schema;

namespace Libratica.DataContext.Entities
{
    public class BookCategory
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        [ForeignKey(nameof(BookId))]
        public Book Book { get; set; } = null!;
        public int CategoryId { get; set; }
        [ForeignKey(nameof(CategoryId))]
        public Category Category { get; set; } = null!;
    }
}