using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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