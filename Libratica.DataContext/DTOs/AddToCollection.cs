using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class AddToCollectionDto
    {
        [Required]
        public string GoogleBooksId { get; set; } = string.Empty;
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Author { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Publisher { get; set; }
        public int? PublicationYear { get; set; }
    }
}