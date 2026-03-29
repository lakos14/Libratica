using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CreateReportDto
    {
        public int? ListingId { get; set; }
        public int? ReportedUserId { get; set; }

        [Required(ErrorMessage = "Ok megadása kötelező")]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;
    }
}