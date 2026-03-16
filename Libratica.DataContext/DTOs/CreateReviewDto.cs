using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Az értékelés 1-5 között lehet")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }
    }
}