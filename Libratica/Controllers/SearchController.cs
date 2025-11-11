using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public SearchController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Könyvek keresése (cím, szerző, ISBN)
        /// </summary>
        [HttpGet("books")]
        public async Task<ActionResult<IEnumerable<BookDto>>> SearchBooks(
            [FromQuery] string? query = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? minYear = null,
            [FromQuery] int? maxYear = null,
            [FromQuery] string? language = null,
            [FromQuery] string? sortBy = "relevance",
            [FromQuery] string? sortOrder = "asc")
        {
            try
            {
                var booksQuery = _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .AsQueryable();

                if (categoryId.HasValue)
                {
                    booksQuery = booksQuery.Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));
                }

                if (minYear.HasValue)
                {
                    booksQuery = booksQuery.Where(b => b.PublicationYear >= minYear.Value);
                }

                if (maxYear.HasValue)
                {
                    booksQuery = booksQuery.Where(b => b.PublicationYear <= maxYear.Value);
                }

                if (!string.IsNullOrWhiteSpace(language))
                {
                    booksQuery = booksQuery.Where(b => b.Language == language);
                }

                var books = await booksQuery.ToListAsync();

                if (!string.IsNullOrWhiteSpace(query))
                {
                    var normalizedQuery = RemoveDiacritics(query.ToLower());
                    books = books.Where(b =>
                        RemoveDiacritics(b.Title.ToLower()).Contains(normalizedQuery) ||
                        RemoveDiacritics(b.Author.ToLower()).Contains(normalizedQuery) ||
                        (b.ISBN != null && b.ISBN.Contains(query)) ||
                        (b.Description != null && RemoveDiacritics(b.Description.ToLower()).Contains(normalizedQuery))
                    ).ToList();
                }

                books = sortBy?.ToLower() switch
                {
                    "title" => sortOrder == "desc" ? books.OrderByDescending(b => b.Title).ToList() : books.OrderBy(b => b.Title).ToList(),
                    "author" => sortOrder == "desc" ? books.OrderByDescending(b => b.Author).ToList() : books.OrderBy(b => b.Author).ToList(),
                    "year" => sortOrder == "desc" ? books.OrderByDescending(b => b.PublicationYear).ToList() : books.OrderBy(b => b.PublicationYear).ToList(),
                    _ => books.OrderBy(b => b.Title).ToList()
                };

                var bookDtos = books.Select(b => new BookDto
                {
                    Id = b.Id,
                    ISBN = b.ISBN,
                    Title = b.Title,
                    Author = b.Author,
                    Publisher = b.Publisher,
                    PublicationYear = b.PublicationYear,
                    Language = b.Language,
                    Description = b.Description,
                    CoverImageUrl = b.CoverImageUrl,
                    PageCount = b.PageCount,
                    Categories = b.BookCategories.Select(bc => new CategoryDto
                    {
                        Id = bc.Category.Id,
                        Name = bc.Category.Name,
                        Description = bc.Category.Description
                    }).ToList(),
                    CreatedAt = b.CreatedAt
                }).ToList();

                return Ok(bookDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Hirdetések keresése (könyv alapján + ár, állapot szűrés)
        /// </summary>
        [HttpGet("listings")]
        public async Task<ActionResult<IEnumerable<ListingDto>>> SearchListings(
            [FromQuery] string? query = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? bookId = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? condition = null,
            [FromQuery] string? location = null,
            [FromQuery] bool? isAvailable = null,
            [FromQuery] string? sortBy = "date",
            [FromQuery] string? sortOrder = "desc")
        {
            try
            {
                var listingsQuery = _context.Listings
                    .Include(l => l.Book)
                        .ThenInclude(b => b.BookCategories)
                            .ThenInclude(bc => bc.Category)
                    .Include(l => l.Seller)
                        .ThenInclude(s => s.Role)
                    .AsQueryable();

                if (categoryId.HasValue)
                {
                    listingsQuery = listingsQuery.Where(l => l.Book.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));
                }

                if (bookId.HasValue)
                {
                    listingsQuery = listingsQuery.Where(l => l.BookId == bookId.Value);
                }

                if (minPrice.HasValue)
                {
                    listingsQuery = listingsQuery.Where(l => l.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    listingsQuery = listingsQuery.Where(l => l.Price <= maxPrice.Value);
                }

                if (!string.IsNullOrWhiteSpace(condition))
                {
                    listingsQuery = listingsQuery.Where(l => l.Condition == condition);
                }

                if (isAvailable.HasValue)
                {
                    listingsQuery = listingsQuery.Where(l => l.IsAvailable == isAvailable.Value);
                }

                var listings = await listingsQuery.ToListAsync();

                if (!string.IsNullOrWhiteSpace(query))
                {
                    var normalizedQuery = RemoveDiacritics(query.ToLower());
                    listings = listings.Where(l =>
                        RemoveDiacritics(l.Book.Title.ToLower()).Contains(normalizedQuery) ||
                        RemoveDiacritics(l.Book.Author.ToLower()).Contains(normalizedQuery) ||
                        (l.Book.ISBN != null && l.Book.ISBN.Contains(query))
                    ).ToList();
                }

                if (!string.IsNullOrWhiteSpace(location))
                {
                    var normalizedLocation = RemoveDiacritics(location.ToLower());
                    listings = listings.Where(l => l.Location != null && RemoveDiacritics(l.Location.ToLower()).Contains(normalizedLocation)).ToList();
                }

                listings = sortBy?.ToLower() switch
                {
                    "price" => sortOrder == "desc" ? listings.OrderByDescending(l => l.Price).ToList() : listings.OrderBy(l => l.Price).ToList(),
                    "views" => sortOrder == "desc" ? listings.OrderByDescending(l => l.ViewsCount).ToList() : listings.OrderBy(l => l.ViewsCount).ToList(),
                    _ => sortOrder == "asc" ? listings.OrderBy(l => l.CreatedAt).ToList() : listings.OrderByDescending(l => l.CreatedAt).ToList()
                };

                var listingDtos = listings.Select(l => new ListingDto
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

                return Ok(listingDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        /// <summary>
        /// Elérhető nyelvek listája
        /// </summary>
        [HttpGet("languages")]
        public async Task<ActionResult<IEnumerable<string>>> GetLanguages()
        {
            try
            {
                var languages = await _context.Books
                    .Where(b => b.Language != null)
                    .Select(b => b.Language!)
                    .Distinct()
                    .OrderBy(l => l)
                    .ToListAsync();

                return Ok(languages);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Elérhető állapotok listája
        /// </summary>
        [HttpGet("conditions")]
        public ActionResult<IEnumerable<string>> GetConditions()
        {
            var conditions = new List<string>
            {
                "mint",
                "excellent",
                "good",
                "fair",
                "poor"
            };

            return Ok(conditions);
        }
        private static string RemoveDiacritics(string text)
        {
            var normalizedString = text.Normalize(System.Text.NormalizationForm.FormD);
            var stringBuilder = new System.Text.StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC);
        }
    }
}