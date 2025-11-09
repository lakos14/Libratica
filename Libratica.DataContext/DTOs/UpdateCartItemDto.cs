using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateCartItemDto
    {
        [Required]
        [Range(1, 100, ErrorMessage = "Mennyiség 1-100 között lehet")]
        public int Quantity { get; set; }
    }
}
