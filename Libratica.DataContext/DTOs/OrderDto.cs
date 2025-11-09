using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libratica.DataContext.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public UserDto Buyer { get; set; } = null!;
        public UserDto Seller { get; set; } = null!;
        public List<OrderItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty; // pending, paid, shipped, delivered, cancelled
        public string? ShippingAddress { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public BookDto Book { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
        public decimal Subtotal => PriceAtPurchase * Quantity;
    }
}
