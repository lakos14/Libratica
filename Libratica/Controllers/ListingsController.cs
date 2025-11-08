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
    public class ListingsController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public ListingsController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Összes hirdetés lekérése (szűrés: bookId, sellerId, category)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListingDto>>> GetListings(
            [FromQuery] int? bookId = null,
            [FromQuery] int? sellerId = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] bool? isAvailable = true)
        {
            try
            {
                var query = _context.Listings
                    .Include(l => l.Book)
                        .ThenInclude(b => b.BookCategories)
                            .ThenInclude(bc => bc.Category)
                    .Include(l => l.Seller)
                        .ThenInclude(s => s.Role)
                    .AsQueryable();

                // Szűrések
                if (bookId.HasValue)
                    query = query.Where(l => l.BookId == bookId.Value);

                if (sellerId.HasValue)
                    query = query.Where(l => l.SellerId == sellerId.Value);

                if (categoryId.HasValue)
                    query = query.Where(l => l.Book.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));

                if (isAvailable.HasValue)
                    query = query.Where(l => l.IsAvailable == isAvailable.Value);

                var listingsQuery = await query
    .OrderByDescending(l => l.CreatedAt)
    .ToListAsync(); // ELŐBB lekérdezés!

                var listings = listingsQuery.Select(l => new ListingDto
                {
                    Id = l.Id,
                    Book = new BookDto
                    {
                        Id = l.Book.Id,
                        ISBN = l.Book.ISBN,
                        Title = l.Book.Title,
                        Author = l.Book.Author,
                        Publisher = l.Book.Publisher,
                        PublicationYear = l.Book.PublicationYear,
                        Language = l.Book.Language,
                        Description = l.Book.Description,
                        CoverImageUrl = l.Book.CoverImageUrl,
                        PageCount = l.Book.PageCount,
                        Categories = l.Book.BookCategories.Select(bc => new CategoryDto
                        {
                            Id = bc.Category.Id,
                            Name = bc.Category.Name,
                            Description = bc.Category.Description
                        }).ToList(),
                        CreatedAt = l.Book.CreatedAt
                    },
                    Seller = new UserDto
                    {
                        Id = l.Seller.Id,
                        Username = l.Seller.Username,
                        FullName = l.Seller.FullName,
                        ProfilePictureUrl = l.Seller.ProfilePictureUrl,
                        RoleName = l.Seller.Role.Name,
                        Rating = l.Seller.Rating,
                        CreatedAt = l.Seller.CreatedAt
                    },
                    Condition = l.Condition,
                    ConditionDescription = l.ConditionDescription,
                    Price = l.Price,
                    Currency = l.Currency,
                    Quantity = l.Quantity,
                    IsAvailable = l.IsAvailable,
                    Location = l.Location,
                    Images = !string.IsNullOrEmpty(l.Images)
                        ? JsonSerializer.Deserialize<List<string>>(l.Images) ?? new List<string>()
                        : new List<string>(),
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt,
                    ViewsCount = l.ViewsCount
                }).ToList();

                return Ok(listings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Egy hirdetés lekérése ID alapján
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ListingDto>> GetListing(int id)
        {
            try
            {
                var listing = await _context.Listings
                    .Include(l => l.Book)
                        .ThenInclude(b => b.BookCategories)
                            .ThenInclude(bc => bc.Category)
                    .Include(l => l.Seller)
                        .ThenInclude(s => s.Role)
                    .Where(l => l.Id == id)
                    .FirstOrDefaultAsync();

                if (listing == null)
                {
                    return NotFound(new { message = "Hirdetés nem található" });
                }

                // Views count növelése
                listing.ViewsCount++;
                await _context.SaveChangesAsync();

                var listingDto = new ListingDto
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
                    Images = listing.Images != null ? JsonSerializer.Deserialize<List<string>>(listing.Images) ?? new List<string>() : new List<string>(),
                    CreatedAt = listing.CreatedAt,
                    UpdatedAt = listing.UpdatedAt,
                    ViewsCount = listing.ViewsCount
                };

                return Ok(listingDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Új hirdetés létrehozása (bejelentkezett user)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ListingDto>> CreateListing([FromBody] CreateListingDto createListingDto)
        {
            try
            {
                // Aktuális user ID kinyerése JWT token-ből
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "Érvénytelen token" });
                }
                var userId = int.Parse(userIdClaim.Value);

                // Könyv létezik-e?
                var bookExists = await _context.Books.AnyAsync(b => b.Id == createListingDto.BookId);
                if (!bookExists)
                {
                    return BadRequest(new { message = "A megadott könyv nem létezik" });
                }

                // Hirdetés létrehozása
                var listing = new Libratica.DataContext.Entities.Listing
                {
                    BookId = createListingDto.BookId,
                    SellerId = userId,
                    Condition = createListingDto.Condition,
                    ConditionDescription = createListingDto.ConditionDescription,
                    Price = createListingDto.Price,
                    Currency = createListingDto.Currency,
                    Quantity = createListingDto.Quantity,
                    IsAvailable = true, // AZONNAL ÉLŐBEN! 🔥
                    Location = createListingDto.Location,
                    Images = createListingDto.Images != null ? JsonSerializer.Serialize(createListingDto.Images) : null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    ViewsCount = 0
                };

                _context.Listings.Add(listing);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetListing), new { id = listing.Id }, new { message = "Hirdetés sikeresen létrehozva!", listingId = listing.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Saját hirdetés frissítése
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> UpdateListing(int id, [FromBody] UpdateListingDto updateListingDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "Érvénytelen token" });
                }
                var userId = int.Parse(userIdClaim.Value);

                var listing = await _context.Listings.FindAsync(id);
                if (listing == null)
                {
                    return NotFound(new { message = "Hirdetés nem található" });
                }

                // Csak saját hirdetést szerkesztheted (kivéve admin)
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (listing.SellerId != userId && userRole != "admin")
                {
                    return Forbid();
                }

                // Frissítés
                if (updateListingDto.Condition != null) listing.Condition = updateListingDto.Condition;
                if (updateListingDto.ConditionDescription != null) listing.ConditionDescription = updateListingDto.ConditionDescription;
                if (updateListingDto.Price.HasValue) listing.Price = updateListingDto.Price.Value;
                if (updateListingDto.Quantity.HasValue) listing.Quantity = updateListingDto.Quantity.Value;
                if (updateListingDto.IsAvailable.HasValue) listing.IsAvailable = updateListingDto.IsAvailable.Value;
                if (updateListingDto.Location != null) listing.Location = updateListingDto.Location;
                if (updateListingDto.Images != null) listing.Images = JsonSerializer.Serialize(updateListingDto.Images);

                listing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Hirdetés sikeresen frissítve!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Saját hirdetés törlése (vagy admin bármit törölhet)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteListing(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "Érvénytelen token" });
                }
                var userId = int.Parse(userIdClaim.Value);

                var listing = await _context.Listings.FindAsync(id);
                if (listing == null)
                {
                    return NotFound(new { message = "Hirdetés nem található" });
                }

                // Csak saját hirdetést törölheted (kivéve admin)
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (listing.SellerId != userId && userRole != "admin")
                {
                    return Forbid();
                }

                _context.Listings.Remove(listing);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Saját hirdetések lekérése
        /// </summary>
        [HttpGet("my-listings")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ListingDto>>> GetMyListings()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "Érvénytelen token" });
                }
                var userId = int.Parse(userIdClaim.Value);

                return await GetListings(sellerId: userId);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
