using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class CheckoutDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Érvénytelen eladó")]
        public int SellerId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Legalább egy tétel szükséges")]
        public List<CheckoutItemDto> Items { get; set; } = new();

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        [RegularExpression("^(cash|transfer)$", ErrorMessage = "Érvénytelen fizetési mód")]
        public string? PaymentMethod { get; set; }
    }

    public class CheckoutItemDto
    {
        public int ListingId { get; set; }

        [Range(1, 100, ErrorMessage = "Mennyiség 1-100 között lehet")]
        public int Quantity { get; set; }

        [Range(0, 1000000, ErrorMessage = "Érvénytelen ár")]
        public decimal Price { get; set; }
    }
}