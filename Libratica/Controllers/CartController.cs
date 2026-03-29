using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public CartController(LibraticaDbContext context)
        {
            _context = context;
        }

        //Saját kosár lekérése
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
                        ListingId = ci.ListingId,
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

        //Termék hozzáadása a kosárhoz
        [HttpPost("add")]
        public async Task<ActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var cart = await GetOrCreateCartAsync(userId);

                var listing = await _context.Listings.FindAsync(addToCartDto.ListingId);
                if (listing == null || !listing.IsAvailable)
                {
                    return BadRequest(new { message = "Hirdetés nem elérhető" });
                }

                if (listing.SellerId == userId)
                {
                    return BadRequest(new { message = "Saját hirdetést nem vásárolhatsz meg!" });
                }

                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ListingId == addToCartDto.ListingId);

                var currentInCart = existingItem?.Quantity ?? 0;

                if (currentInCart + addToCartDto.Quantity > listing.Quantity)
                {
                    var availableToAdd = listing.Quantity - currentInCart;
                    if (availableToAdd <= 0)
                    {
                        return BadRequest(new { message = "Ez a termék már a kosárban van a maximális mennyiségben!" });
                    }
                    return BadRequest(new { message = $"Csak {availableToAdd} db adható még a kosárhoz!" });
                }

                if (existingItem != null)
                {
                    existingItem.Quantity += addToCartDto.Quantity;
                    existingItem.Price = listing.Price;
                }
                else
                {
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

        //Kosár tétel mennyiségének módosítása
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

        //Tétel eltávolítása a kosárból
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

        //Kosár ürítése
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
    }
}