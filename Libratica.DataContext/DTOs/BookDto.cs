using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libratica.DataContext.DTOs
{
    public class BookDto
    {
        public int Id { get; set; }
        public string? ISBN { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? Publisher { get; set; }
        public int? PublicationYear { get; set; }
        public string? Language { get; set; }
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public int? PageCount { get; set; }
        public List<CategoryDto> Categories { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}