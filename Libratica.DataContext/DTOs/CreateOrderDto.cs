using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CreateOrderDto
    {
        [Required(ErrorMessage = "Szállítási cím kötelező")]
        [MaxLength(500)]
        public string ShippingAddress { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? PaymentMethod { get; set; }
    }
}
