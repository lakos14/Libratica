using Libratica.DataContext.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RecommendationsController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public RecommendationsController(LibraticaDbContext context)
        {
            _context = context;
        }

        //Személyre szabott ajánlások a felhasználó vásárlási előzményei alapján
        [HttpGet]
        public async Task<ActionResult> GetRecommendations()
        {
            try
            {
                var userId = GetCurrentUserId();

                var purchasedBookIds = await _context.Orders
                    .Where(o => o.BuyerId == userId && o.Status != "cancelled" && o.Status != "rejected")
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Listing)
                    .SelectMany(o => o.OrderItems.Select(oi => oi.Listing.BookId))
                    .Distinct()
                    .ToListAsync();

                var wishlistBookIds = await _context.Wishlists
                    .Where(w => w.UserId == userId)
                    .Select(w => w.BookId)
                    .ToListAsync();

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

                var directWishlistListings = await _context.Listings
                    .Include(l => l.Book)
                        .ThenInclude(b => b.BookCategories)
                            .ThenInclude(bc => bc.Category)
                    .Include(l => l.Seller)
                        .ThenInclude(s => s.Role)
                    .Where(l =>
                        l.IsAvailable &&
                        l.SellerId != userId &&
                        wishlistBookIds.Contains(l.BookId))
                    .ToListAsync();

                if (preferredCategoryIds.Any())
                {
                    var excludedBookIds = purchasedBookIds
                        .Concat(directWishlistListings.Select(l => l.BookId))
                        .Distinct().ToList();

                    var categoryListings = await _context.Listings
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
                        .Take(8 - directWishlistListings.Count)
                        .ToListAsync();

                    var combined = directWishlistListings.Concat(categoryListings).ToList();

                    recommendations = combined.Select(l => (object)new
                    {
                        l.Id,
                        l.Price,
                        l.Currency,
                        l.Condition,
                        l.Location,
                        Images = !string.IsNullOrEmpty(l.Images)
                            ? JsonSerializer.Deserialize<List<string>>(l.Images) ?? new List<string>()
                            : new List<string>(),
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
                        ReasonText = wishlistBookIds.Contains(l.BookId)
                            ? "A kívánságlistádon szerepel"
                            : "A kívánságlistád és vásárlásaid alapján"
                    }).ToList();
                }
                else
                {
                    var excludedBookIds = purchasedBookIds.Distinct().ToList();

                    var popularListings = await _context.Listings
                        .Include(l => l.Book)
                            .ThenInclude(b => b.BookCategories)
                                .ThenInclude(bc => bc.Category)
                        .Include(l => l.Seller)
                            .ThenInclude(s => s.Role)
                        .Where(l =>
                            l.IsAvailable &&
                            l.SellerId != userId &&
                            !excludedBookIds.Contains(l.BookId))
                        .OrderByDescending(l => l.CreatedAt)
                        .Take(8)
                        .ToListAsync();

                    var combined = directWishlistListings.Concat(
                        popularListings.Where(l => !directWishlistListings.Select(d => d.BookId).Contains(l.BookId))
                    ).Take(8).ToList();

                    recommendations = combined.Select(l => (object)new
                    {
                        l.Id,
                        l.Price,
                        l.Currency,
                        l.Condition,
                        l.Location,
                        Images = !string.IsNullOrEmpty(l.Images)
                            ? JsonSerializer.Deserialize<List<string>>(l.Images) ?? new List<string>()
                            : new List<string>(),
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
                        ReasonText = wishlistBookIds.Contains(l.BookId)
                            ? "A kívánságlistádon szerepel"
                            : "Népszerű a platformon"
                    }).ToList();
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
    }
}