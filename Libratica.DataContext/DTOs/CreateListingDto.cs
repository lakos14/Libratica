using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CreateListingDto
    {
        [Required(ErrorMessage = "Könyv kiválasztása kötelező")]
        public int BookId { get; set; }

        [Required(ErrorMessage = "Állapot megadása kötelező")]
        [RegularExpression("^(mint|excellent|good|fair|poor)$", ErrorMessage = "Érvénytelen állapot")]
        public string Condition { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ConditionDescription { get; set; }

        [Required(ErrorMessage = "Ár megadása kötelező")]
        [Range(100, 1000000, ErrorMessage = "Az ár 100 és 1,000,000 között lehet")]
        public decimal Price { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "HUF";

        [Range(1, 100, ErrorMessage = "Mennyiség 1-100 között lehet")]
        public int Quantity { get; set; } = 1;

        [MaxLength(200)]
        public string? Location { get; set; }

        public List<string>? Images { get; set; }
    }
}
