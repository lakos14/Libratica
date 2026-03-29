using Libratica.DataContext.Context;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Libratica.DataContext.DTOs;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookCollectionController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public BookCollectionController(LibraticaDbContext context)
        {
            _context = context;
        }

        //Könyvkollekció lekérése
        [HttpGet]
        public async Task<ActionResult> GetCollection()
        {
            try
            {
                var userId = GetCurrentUserId();
                var collection = await _context.BookCollections
                    .Where(bc => bc.UserId == userId)
                    .OrderByDescending(bc => bc.CreatedAt)
                    .Select(bc => new
                    {
                        bc.Id,
                        bc.GoogleBooksId,
                        bc.Title,
                        bc.Author,
                        bc.CoverImageUrl,
                        bc.Publisher,
                        bc.PublicationYear,
                        bc.CreatedAt
                    })
                    .ToListAsync();

                return Ok(collection);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Könyvkollekcióhoz hozzáadás
        [HttpPost]
        public async Task<ActionResult> AddToCollection([FromBody] AddToCollectionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var alreadyExists = await _context.BookCollections
                    .AnyAsync(bc => bc.UserId == userId && bc.GoogleBooksId == dto.GoogleBooksId);

                if (alreadyExists)
                    return BadRequest(new { message = "Ez a könyv már szerepel a gyűjteményedben" });

                var item = new BookCollection
                {
                    UserId = userId,
                    GoogleBooksId = dto.GoogleBooksId,
                    Title = dto.Title,
                    Author = dto.Author,
                    CoverImageUrl = dto.CoverImageUrl,
                    Publisher = dto.Publisher,
                    PublicationYear = dto.PublicationYear,
                    CreatedAt = DateTime.UtcNow
                };

                _context.BookCollections.Add(item);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Könyv hozzáadva a gyűjteményhez!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Törlés a kollekcióból
        [HttpDelete("{id}")]
        public async Task<ActionResult> RemoveFromCollection(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var item = await _context.BookCollections
                    .FirstOrDefaultAsync(bc => bc.Id == id && bc.UserId == userId);

                if (item == null)
                    return NotFound(new { message = "Könyv nem található a gyűjteményben" });

                _context.BookCollections.Remove(item);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Könyv eltávolítva a gyűjteményből!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Könyv ellenőrzése a kollekcióban
        [HttpGet("check/{googleBooksId}")]
        public async Task<ActionResult> CheckCollection(string googleBooksId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isInCollection = await _context.BookCollections
                    .AnyAsync(bc => bc.UserId == userId && bc.GoogleBooksId == googleBooksId);

                return Ok(new { isInCollection });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}