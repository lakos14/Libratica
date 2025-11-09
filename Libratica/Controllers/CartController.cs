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
    public class CartController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public CartController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Saját kosár lekérése
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            try
            {
                var userId = GetCurrentUserId();
                var cart = await GetOrCreateCartAsync(userId);

                var cartItems = await _context.CartItems
                    .Include(ci => ci.Listing)
                        .ThenInclude(l => l.Book)
                            .ThenInclude(b => b.BookCategories)
                                .ThenInclude(bc => bc.Category)
                    .Include(ci => ci.Listing)
                        .ThenInclude(l => l.Seller)
                            .ThenInclude(s => s.Role)
                    .Where(ci => ci.CartId == cart.Id)
                    .ToListAsync();

                var cartDto = new CartDto
                {
                    Id = cart.Id,
                    UserId = cart.UserId,
                    Items = cartItems.Select(ci => new CartItemDto
                    {
                        Id = ci.Id,
                        Listing = MapToListingDto(ci.Listing),
                        Quantity = ci.Quantity,
                        Price = ci.Price
                    }).ToList(),
                    TotalAmount = cartItems.Sum(ci => ci.Price * ci.Quantity),
                    CreatedAt = cart.CreatedAt,
                    UpdatedAt = cart.UpdatedAt
                };

                return Ok(cartDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Termék hozzáadása a kosárhoz
        /// </summary>
        [HttpPost("add")]
        public async Task<ActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var cart = await GetOrCreateCartAsync(userId);

                // Listing létezik és elérhető?
                var listing = await _context.Listings.FindAsync(addToCartDto.ListingId);
                if (listing == null || !listing.IsAvailable)
                {
                    return BadRequest(new { message = "Hirdetés nem elérhető" });
                }

                // Elég készlet van?
                if (listing.Quantity < addToCartDto.Quantity)
                {
                    return BadRequest(new { message = $"Csak {listing.Quantity} db elérhető" });
                }

                // Már van a kosárban?
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ListingId == addToCartDto.ListingId);

                if (existingItem != null)
                {
                    // Mennyiség növelése
                    existingItem.Quantity += addToCartDto.Quantity;
                    existingItem.Price = listing.Price; // Frissített ár
                }
                else
                {
                    // Új tétel hozzáadása
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ListingId = addToCartDto.ListingId,
                        Quantity = addToCartDto.Quantity,
                        Price = listing.Price
                    };
                    _context.CartItems.Add(cartItem);
                }

                cart.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Termék hozzáadva a kosárhoz" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Kosár tétel mennyiségének módosítása
        /// </summary>
        [HttpPut("items/{cartItemId}")]
        public async Task<ActionResult> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItem = await _context.CartItems
                    .Include(ci => ci.Cart)
                    .Include(ci => ci.Listing)
                    .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

                if (cartItem == null || cartItem.Cart.UserId != userId)
                {
                    return NotFound(new { message = "Kosár tétel nem található" });
                }

                // Elég készlet van?
                if (cartItem.Listing.Quantity < updateDto.Quantity)
                {
                    return BadRequest(new { message = $"Csak {cartItem.Listing.Quantity} db elérhető" });
                }

                cartItem.Quantity = updateDto.Quantity;
                cartItem.Cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Mennyiség frissítve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Tétel eltávolítása a kosárból
        /// </summary>
        [HttpDelete("items/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItem = await _context.CartItems
                    .Include(ci => ci.Cart)
                    .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

                if (cartItem == null || cartItem.Cart.UserId != userId)
                {
                    return NotFound(new { message = "Kosár tétel nem található" });
                }

                _context.CartItems.Remove(cartItem);
                cartItem.Cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Kosár ürítése
        /// </summary>
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                var userId = GetCurrentUserId();
                var cart = await GetOrCreateCartAsync(userId);

                var cartItems = await _context.CartItems
                    .Where(ci => ci.CartId == cart.Id)
                    .ToListAsync();

                _context.CartItems.RemoveRange(cartItems);
                cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Helper methods
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("Érvénytelen token");
            return int.Parse(userIdClaim.Value);
        }

        private async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        private ListingDto MapToListingDto(Listing listing)
        {
            return new ListingDto
            {
                Id = listing.Id,
                Book = new BookDto
                {
                    Id = listing.Book.Id,
                    ISBN = listing.Book.ISBN,
                    Title = listing.Book.Title,
                    Author = listing.Book.Author,
                    Publisher = listing.Book.Publisher,
                    PublicationYear = listing.Book.PublicationYear,
                    Language = listing.Book.Language,
                    Description = listing.Book.Description,
                    CoverImageUrl = listing.Book.CoverImageUrl,
                    PageCount = listing.Book.PageCount,
                    Categories = listing.Book.BookCategories.Select(bc => new CategoryDto
                    {
                        Id = bc.Category.Id,
                        Name = bc.Category.Name,
                        Description = bc.Category.Description
                    }).ToList(),
                    CreatedAt = listing.Book.CreatedAt
                },
                Seller = new UserDto
                {
                    Id = listing.Seller.Id,
                    Username = listing.Seller.Username,
                    FullName = listing.Seller.FullName,
                    ProfilePictureUrl = listing.Seller.ProfilePictureUrl,
                    RoleName = listing.Seller.Role.Name,
                    Rating = listing.Seller.Rating,
                    CreatedAt = listing.Seller.CreatedAt
                },
                Condition = listing.Condition,
                ConditionDescription = listing.ConditionDescription,
                Price = listing.Price,
                Currency = listing.Currency,
                Quantity = listing.Quantity,
                IsAvailable = listing.IsAvailable,
                Location = listing.Location,
                Images = !string.IsNullOrEmpty(listing.Images)
                    ? JsonSerializer.Deserialize<List<string>>(listing.Images) ?? new List<string>()
                    : new List<string>(),
                CreatedAt = listing.CreatedAt,
                UpdatedAt = listing.UpdatedAt,
                ViewsCount = listing.ViewsCount
            };
        }
    }
}