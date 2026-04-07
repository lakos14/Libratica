using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public BooksController(LibraticaDbContext context)
        {
            _context = context;
        }

        //Összes könyv lekérése
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks([FromQuery] int? categoryId = null)
        {
            try
            {
                var query = _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .AsQueryable();

                if (categoryId.HasValue)
                {
                    query = query.Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));
                }

                var books = await query
                    .Select(b => new BookDto
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
                    })
                    .ToListAsync();

                return Ok(books);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Egy konkrét könyv lekérése ID alapján
        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            try
            {
                var book = await _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .Where(b => b.Id == id)
                    .Select(b => new BookDto
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
                    })
                    .FirstOrDefaultAsync();

                if (book == null)
                {
                    return NotFound(new { message = "Könyv nem található" });
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Új könyv létrehozása (csak admin)
        [HttpPost]
        [Authorize]
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BookDto>> CreateBook([FromBody] CreateBookDto createBookDto)
        {
            try
            {
                var existingBook = await _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .FirstOrDefaultAsync(b =>
                        b.Title.ToLower() == createBookDto.Title.ToLower() &&
                        b.Author.ToLower() == createBookDto.Author.ToLower());

                if (existingBook != null)
                {
                    return Ok(new BookDto
                    {
                        Id = existingBook.Id,
                        ISBN = existingBook.ISBN,
                        Title = existingBook.Title,
                        Author = existingBook.Author,
                        Publisher = existingBook.Publisher,
                        PublicationYear = existingBook.PublicationYear,
                        Language = existingBook.Language,
                        Description = existingBook.Description,
                        CoverImageUrl = existingBook.CoverImageUrl,
                        PageCount = existingBook.PageCount,
                        Categories = existingBook.BookCategories.Select(bc => new CategoryDto
                        {
                            Id = bc.Category.Id,
                            Name = bc.Category.Name,
                            Description = bc.Category.Description
                        }).ToList(),
                        CreatedAt = existingBook.CreatedAt
                    });
                }

                var book = new Libratica.DataContext.Entities.Book
                {
                    ISBN = createBookDto.ISBN,
                    Title = createBookDto.Title,
                    Author = createBookDto.Author,
                    Publisher = createBookDto.Publisher,
                    PublicationYear = createBookDto.PublicationYear,
                    Language = createBookDto.Language,
                    Description = createBookDto.Description,
                    CoverImageUrl = createBookDto.CoverImageUrl,
                    PageCount = createBookDto.PageCount,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Books.Add(book);
                await _context.SaveChangesAsync();

                if (createBookDto.CategoryIds.Any())
                {
                    var bookCategories = createBookDto.CategoryIds.Select(categoryId => new Libratica.DataContext.Entities.BookCategory
                    {
                        BookId = book.Id,
                        CategoryId = categoryId
                    }).ToList();

                    _context.BookCategories.AddRange(bookCategories);
                    await _context.SaveChangesAsync();
                }

                var createdBook = await _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .Where(b => b.Id == book.Id)
                    .Select(b => new BookDto
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
                    })
                    .FirstAsync();

                return CreatedAtAction(nameof(GetBook), new { id = book.Id }, createdBook);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Könyv frissítése (csak admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BookDto>> UpdateBook(int id, [FromBody] UpdateBookDto updateBookDto)
        {
            try
            {
                var book = await _context.Books
                    .Include(b => b.BookCategories)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (book == null)
                {
                    return NotFound(new { message = "Könyv nem található" });
                }

                if (updateBookDto.ISBN != null) book.ISBN = updateBookDto.ISBN;
                if (updateBookDto.Title != null) book.Title = updateBookDto.Title;
                if (updateBookDto.Author != null) book.Author = updateBookDto.Author;
                if (updateBookDto.Publisher != null) book.Publisher = updateBookDto.Publisher;
                if (updateBookDto.PublicationYear.HasValue) book.PublicationYear = updateBookDto.PublicationYear;
                if (updateBookDto.Language != null) book.Language = updateBookDto.Language;
                if (updateBookDto.Description != null) book.Description = updateBookDto.Description;
                if (updateBookDto.CoverImageUrl != null) book.CoverImageUrl = updateBookDto.CoverImageUrl;
                if (updateBookDto.PageCount.HasValue) book.PageCount = updateBookDto.PageCount;

                if (updateBookDto.CategoryIds != null)
                {
                    _context.BookCategories.RemoveRange(book.BookCategories);

                    var bookCategories = updateBookDto.CategoryIds.Select(categoryId => new Libratica.DataContext.Entities.BookCategory
                    {
                        BookId = book.Id,
                        CategoryId = categoryId
                    }).ToList();

                    _context.BookCategories.AddRange(bookCategories);
                }

                await _context.SaveChangesAsync();

                var updatedBook = await _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .Where(b => b.Id == id)
                    .Select(b => new BookDto
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
                    })
                    .FirstAsync();

                return Ok(updatedBook);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Csak azok a könyvek lekérése, amelyekhez van elérhető hirdetés
        [HttpGet("with-available-listings")]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooksWithAvailableListings(
            [FromQuery] string? query = null,
            [FromQuery] string? author = null,
            [FromQuery] int? minYear = null,
            [FromQuery] int? maxYear = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            try
            {
                var booksQuery = _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .Where(b => b.Listings.Any(l => l.IsAvailable == true))
                    .AsQueryable();

                if (!string.IsNullOrEmpty(query))
                    booksQuery = booksQuery.Where(b =>
                        b.Title.Contains(query) ||
                        b.Author.Contains(query) ||
                        b.ISBN.Contains(query));

                if (!string.IsNullOrEmpty(author))
                    booksQuery = booksQuery.Where(b => b.Author.Contains(author));

                if (minYear.HasValue)
                    booksQuery = booksQuery.Where(b => b.PublicationYear >= minYear.Value);

                if (maxYear.HasValue)
                    booksQuery = booksQuery.Where(b => b.PublicationYear <= maxYear.Value);

                if (categoryId.HasValue)
                    booksQuery = booksQuery.Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));

                var books = await booksQuery
                    .OrderByDescending(b => b.CreatedAt)
                    .Select(b => new BookDto
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
                        FirstListingImage = b.Listings
                        .Where(l => l.IsAvailable && l.Images != null)
                        .Select(l => l.Images)
                        .FirstOrDefault(),
                        PageCount = b.PageCount,
                        Categories = b.BookCategories.Select(bc => new CategoryDto
                        {
                            Id = bc.Category.Id,
                            Name = bc.Category.Name,
                            Description = bc.Category.Description
                        }).ToList(),
                        CreatedAt = b.CreatedAt
                    })
                    .ToListAsync();

                var totalCount = books.Count;
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
                var pagedBooks = books
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return Ok(new
                {
                    items = pagedBooks,
                    totalCount,
                    totalPages,
                    currentPage = page,
                    pageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Könyv törlése (csak admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            try
            {
                var book = await _context.Books.FindAsync(id);

                if (book == null)
                {
                    return NotFound(new { message = "Könyv nem található" });
                }

                _context.Books.Remove(book);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}