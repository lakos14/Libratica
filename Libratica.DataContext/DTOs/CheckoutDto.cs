using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CheckoutDto
    {
        public int SellerId { get; set; }

        [Required]
        public List<CheckoutItemDto> Items { get; set; } = new();

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        public string? PaymentMethod { get; set; }
    }

    public class CheckoutItemDto
    {
        public int ListingId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}