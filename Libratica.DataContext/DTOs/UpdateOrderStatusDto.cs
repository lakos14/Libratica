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
        [RegularExpression("^(pending|confirmed|shipped|delivered|cancelled|rejected)$", ErrorMessage = "Érvénytelen státusz")]
        public string Status { get; set; } = string.Empty;
    }
}