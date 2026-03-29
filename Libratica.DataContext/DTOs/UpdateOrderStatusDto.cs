using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateOrderStatusDto
    {
        [Required(ErrorMessage = "Státusz kötelező")]
        [RegularExpression("^(pending|confirmed|shipped|delivered|cancelled|rejected)$", ErrorMessage = "Érvénytelen státusz")]
        public string Status { get; set; } = string.Empty;
    }
}