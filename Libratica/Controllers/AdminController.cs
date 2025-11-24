using Libratica.DataContext.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public AdminController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Admin dashboard statisztikák
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalBooks = await _context.Books.CountAsync();
                var totalListings = await _context.Listings.CountAsync();
                var activeListings = await _context.Listings.CountAsync(l => l.IsAvailable);
                var totalOrders = await _context.Orders.CountAsync();
                var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "pending");
                var totalRevenue = await _context.Orders
                    .Where(o => o.Status != "cancelled")
                    .SumAsync(o => o.TotalAmount);

                // Mai statisztikák
                var today = DateTime.UtcNow.Date;
                var todayUsers = await _context.Users.CountAsync(u => u.CreatedAt >= today);
                var todayListings = await _context.Listings.CountAsync(l => l.CreatedAt >= today);
                var todayOrders = await _context.Orders.CountAsync(o => o.CreatedAt >= today);

                return Ok(new
                {
                    totalUsers,
                    totalBooks,
                    totalListings,
                    activeListings,
                    totalOrders,
                    pendingOrders,
                    totalRevenue,
                    today = new
                    {
                        users = todayUsers,
                        listings = todayListings,
                        orders = todayOrders
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Összes felhasználó listája (admin nézet)
        /// </summary>
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .Include(u => u.Role)
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => new
                    {
                        u.Id,
                        u.Email,
                        u.Username,
                        u.FullName,
                        u.PhoneNumber,
                        RoleName = u.Role.Name,
                        u.IsVerified,
                        u.IsActive,
                        u.Rating,
                        u.CreatedAt,
                        u.LastLoginAt,
                        ListingsCount = u.Listings.Count,
                        OrdersAsBuyerCount = u.OrdersAsBuyer.Count,
                        OrdersAsSellerCount = u.OrdersAsSeller.Count
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Összes hirdetés (admin nézet)
        /// </summary>
        [HttpGet("listings")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllListings()
        {
            try
            {
                var listings = await _context.Listings
                    .Include(l => l.Book)
                    .Include(l => l.Seller)
                    .OrderByDescending(l => l.CreatedAt)
                    .Select(l => new
                    {
                        l.Id,
                        Book = new
                        {
                            l.Book.Id,
                            l.Book.Title,
                            l.Book.Author,
                            l.Book.CoverImageUrl
                        },
                        Seller = new
                        {
                            l.Seller.Id,
                            l.Seller.Username,
                            l.Seller.Email
                        },
                        l.Condition,
                        l.Price,
                        l.Currency,
                        l.Quantity,
                        l.IsAvailable,
                        l.Location,
                        l.ViewsCount,
                        l.CreatedAt,
                        l.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(listings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// User részletei (admin nézet)
        /// </summary>
        [HttpGet("users/{id}")]
        public async Task<ActionResult<object>> GetUserDetails(int id)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Role)
                    .Include(u => u.Listings)
                    .Include(u => u.OrdersAsBuyer)
                    .Include(u => u.OrdersAsSeller)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                {
                    return NotFound(new { message = "Felhasználó nem található" });
                }

                return Ok(new
                {
                    user.Id,
                    user.Email,
                    user.Username,
                    user.FullName,
                    user.PhoneNumber,
                    user.ProfilePictureUrl,
                    user.Bio,
                    RoleName = user.Role.Name,
                    user.IsVerified,
                    user.IsActive,
                    user.Rating,
                    user.CreatedAt,
                    user.UpdatedAt,
                    user.LastLoginAt,
                    Statistics = new
                    {
                        ListingsCount = user.Listings.Count,
                        ActiveListingsCount = user.Listings.Count(l => l.IsAvailable),
                        PurchasesCount = user.OrdersAsBuyer.Count,
                        SalesCount = user.OrdersAsSeller.Count,
                        TotalRevenue = user.OrdersAsSeller
                            .Where(o => o.Status != "cancelled")
                            .Sum(o => o.TotalAmount)
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}