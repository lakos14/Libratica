using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public CategoriesController(LibraticaDbContext context)
        {
            _context = context;
        }

        //Összes kategória lekérése
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            try
            {
                var categories = await _context.Categories
                    .Select(c => new CategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                    })
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Egy kategória lekérése ID alapján
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _context.Categories
                    .Where(c => c.Id == id)
                    .Select(c => new CategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                    })
                    .FirstOrDefaultAsync();

                if (category == null)
                {
                    return NotFound(new { message = "Kategória nem található" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Egy kategória könyveinek lekérése
        [HttpGet("{id}/books")]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetCategoryBooks(int id)
        {
            try
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == id);
                if (!categoryExists)
                {
                    return NotFound(new { message = "Kategória nem található" });
                }

                var books = await _context.Books
                    .Include(b => b.BookCategories)
                        .ThenInclude(bc => bc.Category)
                    .Where(b => b.BookCategories.Any(bc => bc.CategoryId == id))
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
    }
}