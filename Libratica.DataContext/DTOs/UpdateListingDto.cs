using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateListingDto
    {
        [RegularExpression("^(mint|excellent|good|fair|poor)$", ErrorMessage = "Érvénytelen állapot")]
        public string? Condition { get; set; }

        [MaxLength(1000)]
        public string? ConditionDescription { get; set; }

        [Range(100, 1000000, ErrorMessage = "Az ár 100 és 1,000,000 között lehet")]
        public decimal? Price { get; set; }

        [Range(1, 100, ErrorMessage = "Mennyiség 1-100 között lehet")]
        public int? Quantity { get; set; }

        public bool? IsAvailable { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        public List<string>? Images { get; set; }
    }
}