using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateEventStatusDto
    {
        [Required]
        [RegularExpression("^(approved|rejected)$")]
        public string Status { get; set; } = string.Empty;
    }
}