using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public OrdersController(LibraticaDbContext context)
        {
            _context = context;
        }

        //Összes saját rendelés lekérése
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
        {
            try
            {
                var userId = GetCurrentUserId();

                var orders = await _context.Orders
                    .Include(o => o.Buyer).ThenInclude(b => b.Role)
                    .Include(o => o.Seller).ThenInclude(s => s.Role)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Listing).ThenInclude(l => l.Book).ThenInclude(b => b.BookCategories).ThenInclude(bc => bc.Category)
                    .Where(o => o.BuyerId == userId || o.SellerId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                var orderDtos = orders.Select(o => MapToOrderDto(o)).ToList();

                return Ok(orderDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Egy rendelés részletei
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var order = await _context.Orders
                    .Include(o => o.Buyer).ThenInclude(b => b.Role)
                    .Include(o => o.Seller).ThenInclude(s => s.Role)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Listing).ThenInclude(l => l.Book).ThenInclude(b => b.BookCategories).ThenInclude(bc => bc.Category)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound(new { message = "Rendelés nem található" });
                }

                if (order.BuyerId != userId && order.SellerId != userId)
                {
                    return Forbid();
                }

                var orderDto = MapToOrderDto(order);

                return Ok(orderDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Rendelés leadása
        [HttpPost("checkout")]
        [Authorize]
        public async Task<ActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            var userId = GetCurrentUserId();
            foreach (var item in dto.Items)
            {
                var listing = await _context.Listings
                    .Include(l => l.Book)
                    .FirstOrDefaultAsync(l => l.Id == item.ListingId);
                if (listing == null)
                    return NotFound(new { message = $"Hirdetés nem található: {item.ListingId}" });
                if (!listing.IsAvailable)
                    return BadRequest(new { message = $"A hirdetés már nem elérhető: {listing.Book.Title}" });
                if (listing.SellerId != dto.SellerId)
                    return BadRequest(new { message = "Nem minden tétel ugyanattól az eladótól származik" });
                if (listing.Quantity < item.Quantity)
                    return BadRequest(new { message = $"Nincs elegendő készlet: {listing.Book.Title}" });
            }

            var order = new Order
            {
                BuyerId = userId,
                SellerId = dto.SellerId,
                Status = "pending",
                ShippingAddress = dto.ShippingAddress,
                PaymentMethod = dto.PaymentMethod,
                TotalAmount = dto.Items.Sum(x => x.Price * x.Quantity),
                CreatedAt = DateTime.UtcNow
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var item in dto.Items)
            {
                var listing = await _context.Listings.FindAsync(item.ListingId);
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ListingId = item.ListingId,
                    Quantity = item.Quantity,
                    PriceAtPurchase = item.Price
                };
                _context.OrderItems.Add(orderItem);
                listing.Quantity -= item.Quantity;
                if (listing.Quantity == 0)
                    listing.IsAvailable = false;
            }

            var purchasedListingIds = dto.Items.Select(i => i.ListingId).ToList();
            var listingBookIds = await _context.Listings
                .Where(l => purchasedListingIds.Contains(l.Id))
                .Select(l => l.BookId)
                .ToListAsync();

            var wishlistItems = await _context.Wishlists
                .Where(w => w.UserId == userId && listingBookIds.Contains(w.BookId))
                .ToListAsync();

            if (wishlistItems.Any())
                _context.Wishlists.RemoveRange(wishlistItems);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rendelés sikeresen létrehozva!",
                orderId = order.Id
            });
        }

        //Rendelés státuszának frissítése az eladó részéről
        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var order = await _context.Orders.FindAsync(id);

                if (order == null)
                {
                    return NotFound(new { message = "Rendelés nem található" });
                }

                if (order.SellerId != userId)
                {
                    return Forbid();
                }

                var allowedStatuses = new[] { "confirmed", "shipped", "delivered" };

                if (!allowedStatuses.Contains(updateDto.Status))
                {
                    return BadRequest(new { message = "Érvénytelen státusz" });
                }

                order.Status = updateDto.Status;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Státusz frissítve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Rendelés törlése (lemondás csak pending státusznál)
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Listing)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound(new { message = "Rendelés nem található" });
                }

                if (order.BuyerId != userId)
                {
                    return Forbid();
                }

                if (order.Status != "pending")
                {
                    return BadRequest(new { message = "Csak függőben lévő rendelést lehet lemondani" });
                }

                foreach (var orderItem in order.OrderItems)
                {
                    orderItem.Listing.Quantity += orderItem.Quantity;
                    orderItem.Listing.IsAvailable = true;
                }

                order.Status = "cancelled";
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Rendelés elutasítása csak pending státusznál (eladó)
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectOrder(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Listing)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound(new { message = "Rendelés nem található" });
                }

                if (order.SellerId != userId)
                {
                    return Forbid();
                }

                if (order.Status != "pending")
                {
                    return BadRequest(new { message = "Csak függőben lévő rendelést lehet elutasítani" });
                }

                foreach (var orderItem in order.OrderItems)
                {
                    var listing = await _context.Listings.FindAsync(orderItem.ListingId);
                    if (listing != null)
                    {
                        listing.Quantity += orderItem.Quantity;
                        listing.IsAvailable = true;
                        _context.Listings.Update(listing);
                    }
                }

                order.Status = "rejected";
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Rendelés elutasítva" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Vásárolt rendelések
        [HttpGet("purchases")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetPurchases()
        {
            try
            {
                var userId = GetCurrentUserId();

                var orders = await _context.Orders
                    .Include(o => o.Buyer).ThenInclude(b => b.Role)
                    .Include(o => o.Seller).ThenInclude(s => s.Role)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Listing).ThenInclude(l => l.Book).ThenInclude(b => b.BookCategories).ThenInclude(bc => bc.Category)
                    .Where(o => o.BuyerId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                var orderDtos = orders.Select(o => MapToOrderDto(o)).ToList();

                return Ok(orderDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Eladott rendelések
        [HttpGet("sales")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetSales()
        {
            try
            {
                var userId = GetCurrentUserId();

                var orders = await _context.Orders
                    .Include(o => o.Buyer).ThenInclude(b => b.Role)
                    .Include(o => o.Seller).ThenInclude(s => s.Role)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Listing).ThenInclude(l => l.Book).ThenInclude(b => b.BookCategories).ThenInclude(bc => bc.Category)
                    .Where(o => o.SellerId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                var orderDtos = orders.Select(o => MapToOrderDto(o)).ToList();

                return Ok(orderDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private OrderDto MapToOrderDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                Buyer = new UserDto
                {
                    Id = order.Buyer.Id,
                    Username = order.Buyer.Username,
                    FullName = order.Buyer.FullName,
                    Email = order.Buyer.Email,
                    ProfilePictureUrl = order.Buyer.ProfilePictureUrl,
                    RoleName = order.Buyer.Role.Name,
                    Rating = order.Buyer.Rating,
                    CreatedAt = order.Buyer.CreatedAt,
                    PhoneNumber = order.Buyer.PhoneNumber,
                    ShowPhoneNumber = order.Buyer.ShowPhoneNumber
                },
                Seller = new UserDto
                {
                    Id = order.Seller.Id,
                    Username = order.Seller.Username,
                    FullName = order.Seller.FullName,
                    Email = order.Seller.Email,
                    ProfilePictureUrl = order.Seller.ProfilePictureUrl,
                    RoleName = order.Seller.Role.Name,
                    Rating = order.Seller.Rating,
                    CreatedAt = order.Seller.CreatedAt,
                    PhoneNumber = order.Seller.PhoneNumber,
                    ShowPhoneNumber = order.Seller.ShowPhoneNumber
                },
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    Book = new BookDto
                    {
                        Id = oi.Listing.Book.Id,
                        ISBN = oi.Listing.Book.ISBN,
                        Title = oi.Listing.Book.Title,
                        Author = oi.Listing.Book.Author,
                        Publisher = oi.Listing.Book.Publisher,
                        PublicationYear = oi.Listing.Book.PublicationYear,
                        Language = oi.Listing.Book.Language,
                        Description = oi.Listing.Book.Description,
                        CoverImageUrl = oi.Listing.Book.CoverImageUrl,
                        PageCount = oi.Listing.Book.PageCount,
                        Categories = oi.Listing.Book.BookCategories.Select(bc => new CategoryDto
                        {
                            Id = bc.Category.Id,
                            Name = bc.Category.Name,
                            Description = bc.Category.Description
                        }).ToList(),
                        CreatedAt = oi.Listing.Book.CreatedAt
                    },
                    Quantity = oi.Quantity,
                    PriceAtPurchase = oi.PriceAtPurchase,
                    Images = !string.IsNullOrEmpty(oi.Listing.Images)
                        ? JsonSerializer.Deserialize<List<string>>(oi.Listing.Images) ?? new List<string>()
                        : new List<string>(),
                }).ToList(),
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt
            };
        }
    }
}