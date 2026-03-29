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
    public class ReviewsController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public ReviewsController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Értékelés létrehozása (vevő → eladó VAGY eladó → vevő)
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

                if (order == null)
                    return NotFound(new { message = "Rendelés nem található" });

                if (order.Status != "delivered")
                    return BadRequest(new { message = "Csak teljesített rendelést lehet értékelni" });

                // Meghatározzuk ki értékel kit
                int reviewedUserId;
                if (order.BuyerId == userId)
                {
                    reviewedUserId = order.SellerId; // vevő értékeli az eladót
                }
                else if (order.SellerId == userId)
                {
                    reviewedUserId = order.BuyerId; // eladó értékeli a vevőt
                }
                else
                {
                    return Forbid();
                }

                // Már értékelt-e ebben az irányban
                var alreadyReviewed = await _context.Reviews
                    .AnyAsync(r => r.OrderId == dto.OrderId && r.ReviewerId == userId);

                if (alreadyReviewed)
                    return BadRequest(new { message = "Ezt a rendelést már értékelted" });

                var review = new Review
                {
                    OrderId = dto.OrderId,
                    ReviewerId = userId,
                    ReviewedUserId = reviewedUserId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Frissítjük az értékelt user átlagos ratingját
                await UpdateUserRating(reviewedUserId);

                return Ok(new { message = "Értékelés sikeresen elküldve!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Egy felhasználó értékelései
        /// </summary>
        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetUserReviews(int userId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.Reviewer).ThenInclude(u => u.Role)
                    .Include(r => r.ReviewedUser).ThenInclude(u => u.Role)
                    .Where(r => r.ReviewedUserId == userId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new ReviewDto
                    {
                        Id = r.Id,
                        OrderId = r.OrderId,
                        Reviewer = new UserDto
                        {
                            Id = r.Reviewer.Id,
                            Username = r.Reviewer.Username,
                            FullName = r.Reviewer.FullName,
                            RoleName = r.Reviewer.Role.Name,
                            Rating = r.Reviewer.Rating,
                            CreatedAt = r.Reviewer.CreatedAt
                        },
                        ReviewedUser = new UserDto
                        {
                            Id = r.ReviewedUser.Id,
                            Username = r.ReviewedUser.Username,
                            RoleName = r.ReviewedUser.Role.Name,
                            Rating = r.ReviewedUser.Rating,
                            CreatedAt = r.ReviewedUser.CreatedAt
                        },
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Egy rendeléshez tartozó értékelések
        /// </summary>
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetOrderReviews(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var order = await _context.Orders.FindAsync(orderId);

                if (order == null)
                    return NotFound(new { message = "Rendelés nem található" });

                if (order.BuyerId != userId && order.SellerId != userId)
                    return Forbid();

                var reviews = await _context.Reviews
                    .Include(r => r.Reviewer).ThenInclude(u => u.Role)
                    .Include(r => r.ReviewedUser).ThenInclude(u => u.Role)
                    .Where(r => r.OrderId == orderId)
                    .Select(r => new ReviewDto
                    {
                        Id = r.Id,
                        OrderId = r.OrderId,
                        Reviewer = new UserDto
                        {
                            Id = r.Reviewer.Id,
                            Username = r.Reviewer.Username,
                            RoleName = r.Reviewer.Role.Name,
                            Rating = r.Reviewer.Rating,
                            CreatedAt = r.Reviewer.CreatedAt
                        },
                        ReviewedUser = new UserDto
                        {
                            Id = r.ReviewedUser.Id,
                            Username = r.ReviewedUser.Username,
                            RoleName = r.ReviewedUser.Role.Name,
                            Rating = r.ReviewedUser.Rating,
                            CreatedAt = r.ReviewedUser.CreatedAt
                        },
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task UpdateUserRating(int userId)
        {
            var ratings = await _context.Reviews
                .Where(r => r.ReviewedUserId == userId)
                .Select(r => r.Rating)
                .ToListAsync();

            if (ratings.Any())
            {
                var avg = (decimal)ratings.Average();
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.Rating = Math.Round(avg, 2);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}