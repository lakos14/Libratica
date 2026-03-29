using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WishlistController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public WishlistController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Saját kívánságlista lekérése
        /// </summary>
        [HttpGet]
        public async Task<ActionResult> GetWishlist()
        {
            try
            {
                var userId = GetCurrentUserId();

                var wishlist = await _context.Wishlists
                    .Include(w => w.Book)
                        .ThenInclude(b => b.BookCategories)
                            .ThenInclude(bc => bc.Category)
                    .Include(w => w.Book)
                        .ThenInclude(b => b.Listings)
                    .Where(w => w.UserId == userId)
                    .OrderByDescending(w => w.CreatedAt)
                    .Select(w => new
                    {
                        w.Id,
                        w.CreatedAt,
                        Book = new
                        {
                            w.Book.Id,
                            w.Book.Title,
                            w.Book.Author,
                            w.Book.Publisher,
                            w.Book.PublicationYear,
                            w.Book.CoverImageUrl,
                            w.Book.Language,
                            Categories = w.Book.BookCategories.Select(bc => new
                            {
                                bc.Category.Id,
                                bc.Category.Name
                            }),
                            AvailableListingsCount = w.Book.Listings.Count(l => l.IsAvailable),
                            MinPrice = w.Book.Listings.Where(l => l.IsAvailable).Any()
                            ? w.Book.Listings.Where(l => l.IsAvailable).Min(l => l.Price)
                            : (decimal?)null,
                                                FirstListingImage = w.Book.Listings
                            .Where(l => l.IsAvailable && l.Images != null)
                            .Select(l => l.Images)
                            .FirstOrDefault()
                        }
                    })
                    .ToListAsync();

                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Könyv hozzáadása a kívánságlistához
        /// </summary>
        [HttpPost("{bookId}")]
        public async Task<ActionResult> AddToWishlist(int bookId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var bookExists = await _context.Books.AnyAsync(b => b.Id == bookId);
                if (!bookExists)
                    return NotFound(new { message = "Könyv nem található" });

                var alreadyExists = await _context.Wishlists
                    .AnyAsync(w => w.UserId == userId && w.BookId == bookId);

                if (alreadyExists)
                    return BadRequest(new { message = "Ez a könyv már szerepel a kívánságlistádon" });

                var wishlistItem = new Wishlist
                {
                    UserId = userId,
                    BookId = bookId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Wishlists.Add(wishlistItem);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Könyv hozzáadva a kívánságlistához!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Könyv eltávolítása a kívánságlistából
        /// </summary>
        [HttpDelete("{bookId}")]
        public async Task<ActionResult> RemoveFromWishlist(int bookId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var wishlistItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);

                if (wishlistItem == null)
                    return NotFound(new { message = "Könyv nem szerepel a kívánságlistádon" });

                _context.Wishlists.Remove(wishlistItem);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Könyv eltávolítva a kívánságlistából!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Ellenőrzés hogy egy könyv szerepel-e a kívánságlistán
        /// </summary>
        [HttpGet("check/{bookId}")]
        public async Task<ActionResult> CheckWishlist(int bookId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var isInWishlist = await _context.Wishlists
                    .AnyAsync(w => w.UserId == userId && w.BookId == bookId);

                return Ok(new { isInWishlist });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}