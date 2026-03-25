using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CreateEventDto
    {
        [Required(ErrorMessage = "Cím kötelező")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Típus kötelező")]
        [RegularExpression("^(bookfair|bookswap)$", ErrorMessage = "Érvénytelen típus")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "Dátum kötelező")]
        public DateTime EventDate { get; set; }

        [Required(ErrorMessage = "Helyszín kötelező")]
        [MaxLength(300)]
        public string Location { get; set; } = string.Empty;
    }
}