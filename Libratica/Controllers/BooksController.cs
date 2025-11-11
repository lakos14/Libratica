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

        /// <summary>
        /// Összes könyv lekérése (opcionális kategória szűrés)
        /// </summary>
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

        /// <summary>
        /// Egy konkrét könyv lekérése ID alapján
        /// </summary>
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

        /// <summary>
        /// Új könyv létrehozása (csak admin)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BookDto>> CreateBook([FromBody] CreateBookDto createBookDto)
        {
            try
            {
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

        /// <summary>
        /// Könyv frissítése (csak admin)
        /// </summary>
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

        /// <summary>
        /// Könyv törlése (csak admin)
        /// </summary>
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