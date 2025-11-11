using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public OrdersController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Összes rendelés lekérése (saját rendelések)
        /// </summary>
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

        /// <summary>
        /// Egy rendelés részletei
        /// </summary>
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

        /// <summary>
        /// Rendelés leadása (kosár alapján)
        /// </summary>
        [HttpPost("checkout")]
        public async Task<ActionResult<OrderDto>> Checkout([FromBody] CreateOrderDto createOrderDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Listing)
                            .ThenInclude(l => l.Book)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || !cart.CartItems.Any())
                {
                    return BadRequest(new { message = "A kosár üres" });
                }

                foreach (var cartItem in cart.CartItems)
                {
                    if (!cartItem.Listing.IsAvailable)
                    {
                        return BadRequest(new { message = $"{cartItem.Listing.Book.Title} már nem elérhető" });
                    }

                    if (cartItem.Listing.Quantity < cartItem.Quantity)
                    {
                        return BadRequest(new { message = $"{cartItem.Listing.Book.Title} - csak {cartItem.Listing.Quantity} db elérhető" });
                    }
                }

                var ordersBySeller = cart.CartItems.GroupBy(ci => ci.Listing.SellerId);

                var createdOrders = new List<Order>();

                foreach (var sellerGroup in ordersBySeller)
                {
                    var sellerId = sellerGroup.Key;
                    var items = sellerGroup.ToList();

                    var order = new Order
                    {
                        BuyerId = userId,
                        SellerId = sellerId,
                        TotalAmount = items.Sum(ci => ci.Price * ci.Quantity),
                        Status = "pending",
                        ShippingAddress = createOrderDto.ShippingAddress,
                        PaymentMethod = createOrderDto.PaymentMethod,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();

                    foreach (var cartItem in items)
                    {
                        var orderItem = new OrderItem
                        {
                            OrderId = order.Id,
                            ListingId = cartItem.ListingId,
                            Quantity = cartItem.Quantity,
                            PriceAtPurchase = cartItem.Price
                        };

                        _context.OrderItems.Add(orderItem);

                        cartItem.Listing.Quantity -= cartItem.Quantity;

                        if (cartItem.Listing.Quantity == 0)
                        {
                            cartItem.Listing.IsAvailable = false;
                        }
                    }

                    createdOrders.Add(order);
                }

                _context.CartItems.RemoveRange(cart.CartItems);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Rendelés sikeresen leadva!",
                    orderIds = createdOrders.Select(o => o.Id).ToList(),
                    totalOrders = createdOrders.Count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Rendelés státuszának frissítése (eladó)
        /// </summary>
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

        /// <summary>
        /// Rendelés törlése (lemondás - csak pending státusznál)
        /// </summary>
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

        /// <summary>
        /// Vásárolt rendelések (mint vevő)
        /// </summary>
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

        /// <summary>
        /// Eladott rendelések (mint eladó)
        /// </summary>
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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("Érvénytelen token");
            return int.Parse(userIdClaim.Value);
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
                    CreatedAt = order.Buyer.CreatedAt
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
                    CreatedAt = order.Seller.CreatedAt
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
                    PriceAtPurchase = oi.PriceAtPurchase
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