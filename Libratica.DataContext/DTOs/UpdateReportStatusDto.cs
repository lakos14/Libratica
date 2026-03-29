using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateReportStatusDto
    {
        [Required]
        [RegularExpression("^(resolved|dismissed)$")]
        public string Status { get; set; } = string.Empty;
    }
}