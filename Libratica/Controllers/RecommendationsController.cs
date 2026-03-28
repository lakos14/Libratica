using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
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
    public class RecommendationsController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public RecommendationsController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Személyre szabott ajánlások a felhasználó vásárlási előzményei alapján
        /// </summary>
        [HttpGet]
        public async Task<ActionResult> GetRecommendations()
        {
            try
            {
                var userId = GetCurrentUserId();

                // 1. Lekérjük a felhasználó korábbi rendeléseit
                var purchasedBookIds = await _context.Orders
                    .Where(o => o.BuyerId == userId && o.Status != "cancelled")
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Listing)
                    .SelectMany(o => o.OrderItems.Select(oi => oi.Listing.BookId))
                    .Distinct()
                    .ToListAsync();

                // 2. Lekérjük a kívánságlista könyveit
                var wishlistBookIds = await _context.Wishlists
                    .Where(w => w.UserId == userId)
                    .Select(w => w.BookId)
                    .ToListAsync();

                // 3. Lekérjük a vásárolt könyvek kategóriáit
                var wishlistCategoryIds = await _context.Wishlists
                    .Where(w => w.UserId == userId)
                    .SelectMany(w => w.Book.BookCategories.Select(bc => bc.CategoryId))
                    .Distinct()
                    .ToListAsync();

                List<int> preferredCategoryIds;

                if (wishlistCategoryIds.Any())
                {
                    preferredCategoryIds = wishlistCategoryIds;
                }
                else
                {
                    preferredCategoryIds = await _context.BookCategories
                        .Where(bc => purchasedBookIds.Contains(bc.BookId))
                        .Select(bc => bc.CategoryId)
                        .Distinct()
                        .ToListAsync();
                }

                List<object> recommendations;

                if (preferredCategoryIds.Any())
                {
                    // 4a. Ha van vásárlási előzmény — kategória alapú ajánlás
                    var excludedBookIds = purchasedBookIds.Distinct().ToList();

                    recommendations = await _context.Listings
                        .Include(l => l.Book)
                            .ThenInclude(b => b.BookCategories)
                                .ThenInclude(bc => bc.Category)
                        .Include(l => l.Seller)
                            .ThenInclude(s => s.Role)
                        .Where(l =>
                            l.IsAvailable &&
                            l.SellerId != userId &&
                            !excludedBookIds.Contains(l.BookId) &&
                            l.Book.BookCategories.Any(bc => preferredCategoryIds.Contains(bc.CategoryId)))
                        .OrderByDescending(l => l.CreatedAt)
                        .Take(8)
                        .Select(l => (object)new
                        {
                            l.Id,
                            l.Price,
                            l.Currency,
                            l.Condition,
                            l.Location,
                            Book = new
                            {
                                l.Book.Id,
                                l.Book.Title,
                                l.Book.Author,
                                l.Book.CoverImageUrl,
                                Categories = l.Book.BookCategories.Select(bc => bc.Category.Name)
                            },
                            Seller = new
                            {
                                l.Seller.Id,
                                l.Seller.Username,
                                l.Seller.Rating
                            },
                            ReasonText = "A kívánságlistád és vásárlásaid alapján"
                        })
                        .ToListAsync();
                }
                else
                {
                    // 4b. Ha nincs vásárlási előzmény — legnépszerűbb hirdetések
                    recommendations = await _context.Listings
                        .Include(l => l.Book)
                            .ThenInclude(b => b.BookCategories)
                                .ThenInclude(bc => bc.Category)
                        .Include(l => l.Seller)
                            .ThenInclude(s => s.Role)
                        .Where(l => l.IsAvailable && l.SellerId != userId)
                        .OrderByDescending(l => l.ViewsCount)
                        .Take(8)
                        .Select(l => (object)new
                        {
                            l.Id,
                            l.Price,
                            l.Currency,
                            l.Condition,
                            l.Location,
                            Book = new
                            {
                                l.Book.Id,
                                l.Book.Title,
                                l.Book.Author,
                                l.Book.CoverImageUrl,
                                Categories = l.Book.BookCategories.Select(bc => bc.Category.Name)
                            },
                            Seller = new
                            {
                                l.Seller.Id,
                                l.Seller.Username,
                                l.Seller.Rating
                            },
                            ReasonText = "Népszerű a platformon"
                        })
                        .ToListAsync();
                }

                return Ok(new
                {
                    recommendations,
                    basedOn = preferredCategoryIds.Any() ? "purchase_history" : "popularity",
                    message = preferredCategoryIds.Any()
                        ? "A kívánságlistád alapján ajánljuk"
                        : "Még nincs kívánságlistád vagy vásárlásod, ezért a legnépszerűbb könyveket ajánljuk"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) throw new UnauthorizedAccessException("Érvénytelen token");
            return int.Parse(claim.Value);
        }
    }
}