using Libratica.DataContext.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Libratica.DataContext.DTOs;

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
        /// <summary>
        /// Felhasználó tiltása / aktiválása
        /// </summary>
        [HttpPut("users/{id}/toggle-active")]
        public async Task<ActionResult> ToggleUserActive(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "Felhasználó nem található" });

                user.IsActive = !user.IsActive;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = user.IsActive ? "Felhasználó aktiválva" : "Felhasználó tiltva",
                    isActive = user.IsActive
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Szerepkör változtatás (user <-> admin)
        /// </summary>
        [HttpPut("users/{id}/toggle-role")]
        public async Task<ActionResult> ToggleUserRole(int id)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                    return NotFound(new { message = "Felhasználó nem található" });

                var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "admin");
                var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "user");

                user.RoleId = user.Role.Name == "admin" ? userRole!.Id : adminRole!.Id;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = user.RoleId == adminRole!.Id ? "Admin szerepkör adva" : "User szerepkörre visszaállítva"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Hirdetés inaktiválása / aktiválása
        /// </summary>
        [HttpPut("listings/{id}/toggle-available")]
        public async Task<ActionResult> ToggleListingAvailable(int id)
        {
            try
            {
                var listing = await _context.Listings.FindAsync(id);
                if (listing == null)
                    return NotFound(new { message = "Hirdetés nem található" });

                listing.IsAvailable = !listing.IsAvailable;
                listing.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = listing.IsAvailable ? "Hirdetés aktiválva" : "Hirdetés inaktiválva",
                    isAvailable = listing.IsAvailable
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Hirdetés törlése
        /// </summary>
        [HttpDelete("listings/{id}")]
        public async Task<ActionResult> DeleteListing(int id)
        {
            try
            {
                var listing = await _context.Listings
                    .Include(l => l.OrderItems)
                    .FirstOrDefaultAsync(l => l.Id == id);

                if (listing == null)
                    return NotFound(new { message = "Hirdetés nem található" });

                // Ha tartoznak hozzá rendelés tételek, csak inaktiváljuk
                if (listing.OrderItems.Any())
                {
                    listing.IsAvailable = false;
                    listing.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Hirdetés inaktiválva (rendelések tartoznak hozzá, nem törölhető)" });
                }

                // Kosár tételek törlése először
                var cartItems = await _context.CartItems
                    .Where(ci => ci.ListingId == id)
                    .ToListAsync();
                _context.CartItems.RemoveRange(cartItems);

                _context.Listings.Remove(listing);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Hirdetés törölve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Kategóriák lekérése
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.Categories
                    .OrderBy(c => c.Name)
                    .Select(c => new { c.Id, c.Name, c.Description })
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Új kategória hozzáadása
        /// </summary>
        [HttpPost("categories")]
        public async Task<ActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            try
            {
                var exists = await _context.Categories.AnyAsync(c => c.Name == dto.Name);
                if (exists)
                    return BadRequest(new { message = "Ez a kategória már létezik" });

                var category = new Libratica.DataContext.Entities.Category
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Kategória létrehozva", id = category.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Kategória törlése
        /// </summary>
        [HttpDelete("categories/{id}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
                if (category == null)
                    return NotFound(new { message = "Kategória nem található" });

                var hasBooks = await _context.BookCategories.AnyAsync(bc => bc.CategoryId == id);
                if (hasBooks)
                    return BadRequest(new { message = "Nem törölhető, könyvek tartoznak hozzá" });

                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Kategória törölve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        /// <summary>
        /// Összes esemény lekérése (admin nézet)
        /// </summary>
        [HttpGet("events")]
        public async Task<ActionResult> GetAllEvents()
        {
            try
            {
                var events = await _context.Events
                    .Include(e => e.Organizer)
                    .Include(e => e.Attendees)
                    .OrderByDescending(e => e.CreatedAt)
                    .Select(e => new
                    {
                        e.Id,
                        e.Title,
                        e.Type,
                        e.EventDate,
                        e.Location,
                        e.Status,
                        e.CreatedAt,
                        Organizer = new { e.Organizer.Id, e.Organizer.Username },
                        AttendeesCount = e.Attendees.Count
                    })
                    .ToListAsync();

                return Ok(events);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Esemény jóváhagyása / elutasítása
        /// </summary>
        [HttpPut("events/{id}/status")]
        public async Task<ActionResult> UpdateEventStatus(int id, [FromBody] UpdateEventStatusDto dto)
        {
            try
            {
                var ev = await _context.Events.FindAsync(id);
                if (ev == null)
                    return NotFound(new { message = "Esemény nem található" });

                ev.Status = dto.Status;
                ev.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = dto.Status == "approved" ? "Esemény jóváhagyva!" : "Esemény elutasítva!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Esemény törlése (admin)
        /// </summary>
        [HttpDelete("events/{id}")]
        public async Task<ActionResult> DeleteEvent(int id)
        {
            try
            {
                var ev = await _context.Events.FindAsync(id);
                if (ev == null)
                    return NotFound(new { message = "Esemény nem található" });

                _context.Events.Remove(ev);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Esemény törölve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}