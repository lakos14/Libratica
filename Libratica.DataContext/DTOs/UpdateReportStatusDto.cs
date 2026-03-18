using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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