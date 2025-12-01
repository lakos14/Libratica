using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Libratica.Models.DTOs
{
    public class CheckoutDto
    {
        public int SellerId { get; set; }

        public List<CheckoutItemDto> Items { get; set; }

        [Required]
        public string ShippingAddress { get; set; }

        public string? PaymentMethod { get; set; }
    }

    public class CheckoutItemDto
    {
        public int ListingId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}