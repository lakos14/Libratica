using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CreateEventCommentDto
    {
        [Required(ErrorMessage = "Komment tartalma kötelező")]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
}