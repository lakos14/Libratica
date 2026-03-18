using Libratica.DataContext.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public UsersController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Felhasználó publikus profilja
        /// </summary>
        [HttpGet("{username}")]
        public async Task<ActionResult> GetPublicProfile(string username)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Role)
                    .Include(u => u.Listings).ThenInclude(l => l.Book)
                    .Include(u => u.ReviewsReceived).ThenInclude(r => r.Reviewer)
                    .FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                    return NotFound(new { message = "Felhasználó nem található" });

                var activeListings = user.Listings
                    .Where(l => l.IsAvailable)
                    .OrderByDescending(l => l.CreatedAt)
                    .Select(l => new
                    {
                        l.Id,
                        l.Price,
                        l.Currency,
                        l.Condition,
                        l.Location,
                        l.CreatedAt,
                        Book = new
                        {
                            l.Book.Id,
                            l.Book.Title,
                            l.Book.Author,
                            l.Book.CoverImageUrl
                        }
                    });

                var reviews = user.ReviewsReceived
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        r.Id,
                        r.Rating,
                        r.Comment,
                        r.CreatedAt,
                        Reviewer = new
                        {
                            r.Reviewer.Id,
                            r.Reviewer.Username
                        }
                    });

                return Ok(new
                {
                    user.Id,
                    user.Username,
                    user.FullName,
                    user.ProfilePictureUrl,
                    user.Bio,
                    user.Rating,
                    user.CreatedAt,
                    ActiveListingsCount = activeListings.Count(),
                    Listings = activeListings,
                    Reviews = reviews
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}