using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateBookDto
    {
        [MaxLength(20)]
        public string? ISBN { get; set; }

        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(200)]
        public string? Author { get; set; }

        [MaxLength(200)]
        public string? Publisher { get; set; }

        [Range(1000, 2100)]
        public int? PublicationYear { get; set; }

        [MaxLength(50)]
        public string? Language { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        [Range(1, 10000)]
        public int? PageCount { get; set; }

        public List<int>? CategoryIds { get; set; }
    }
}
