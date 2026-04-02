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

        [Range(1, 100, ErrorMessage = "Mennyiség 1-100 között lehet")]
        public int Quantity { get; set; }

        [Range(0.01, 1000000, ErrorMessage = "Érvénytelen ár")]
        public decimal Price { get; set; }
    }
}