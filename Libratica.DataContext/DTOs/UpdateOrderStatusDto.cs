using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateOrderStatusDto
    {
        [Required(ErrorMessage = "Státusz kötelező")]
        [RegularExpression("^(pending|paid|shipped|delivered|cancelled)$", ErrorMessage = "Érvénytelen státusz")]
        public string Status { get; set; } = string.Empty;
    }
}
