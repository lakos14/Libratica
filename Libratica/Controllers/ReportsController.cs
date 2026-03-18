using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly LibraticaDbContext _context;

        public ReportsController(LibraticaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Hirdetés vagy felhasználó jelentése
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> CreateReport([FromBody] CreateReportDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (dto.ListingId == null && dto.ReportedUserId == null)
                    return BadRequest(new { message = "Hirdetés vagy felhasználó megadása kötelező" });

                if (dto.ListingId != null && dto.ReportedUserId != null)
                    return BadRequest(new { message = "Egyszerre csak egyet lehet jelenteni" });

                // Ne lehessen saját magát jelenteni
                if (dto.ReportedUserId == userId)
                    return BadRequest(new { message = "Saját magadat nem jelentheted" });

                // Ne lehessen saját hirdetését jelenteni
                if (dto.ListingId != null)
                {
                    var listing = await _context.Listings.FindAsync(dto.ListingId);
                    if (listing?.SellerId == userId)
                        return BadRequest(new { message = "Saját hirdetésedet nem jelentheted" });
                }

                // Már jelentette-e
                var alreadyReported = await _context.Reports.AnyAsync(r =>
                    r.ReporterId == userId &&
                    r.ListingId == dto.ListingId &&
                    r.ReportedUserId == dto.ReportedUserId &&
                    r.Status == "pending");

                if (alreadyReported)
                    return BadRequest(new { message = "Ezt már jelentetted" });

                var report = new Report
                {
                    ReporterId = userId,
                    ListingId = dto.ListingId,
                    ReportedUserId = dto.ReportedUserId,
                    Reason = dto.Reason,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Reports.Add(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Jelentés elküldve, köszönjük!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Összes report lekérése (csak admin)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> GetReports([FromQuery] string? status = null)
        {
            try
            {
                var query = _context.Reports
                    .Include(r => r.Reporter).ThenInclude(u => u.Role)
                    .Include(r => r.ReportedUser).ThenInclude(u => u.Role)
                    .Include(r => r.Listing).ThenInclude(l => l.Book)
                    .Include(r => r.Listing).ThenInclude(l => l.Seller).ThenInclude(s => s.Role)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(r => r.Status == status);

                var reports = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                var result = reports.Select(r => new
                {
                    r.Id,
                    Reporter = new { r.Reporter.Id, r.Reporter.Username, r.Reporter.Email },
                    ReportedUser = r.ReportedUser != null ? new { r.ReportedUser.Id, r.ReportedUser.Username, r.ReportedUser.Email } : null,
                    Listing = r.Listing != null ? new
                    {
                        r.Listing.Id,
                        r.Listing.Book.Title,
                        r.Listing.Book.Author,
                        r.Listing.Price,
                        Seller = new { r.Listing.Seller.Id, r.Listing.Seller.Username }
                    } : null,
                    r.Reason,
                    r.Status,
                    r.CreatedAt
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Report státuszának frissítése (admin)
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> UpdateReportStatus(int id, [FromBody] UpdateReportStatusDto dto)
        {
            try
            {
                var report = await _context.Reports
                    .Include(r => r.Listing)
                    .Include(r => r.ReportedUser)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (report == null)
                    return NotFound(new { message = "Report nem található" });

                report.Status = dto.Status;
                report.UpdatedAt = DateTime.UtcNow;

                // Ha elfogadják a reportot és hirdetés, törlik a hirdetést
                if (dto.Status == "resolved" && report.ListingId != null)
                {
                    var listing = await _context.Listings.FindAsync(report.ListingId);
                    if (listing != null)
                    {
                        listing.IsAvailable = false;
                        listing.UpdatedAt = DateTime.UtcNow;
                    }
                }

                // Ha elfogadják és felhasználó, letiltják
                if (dto.Status == "resolved" && report.ReportedUserId != null)
                {
                    var user = await _context.Users.FindAsync(report.ReportedUserId);
                    if (user != null)
                    {
                        user.IsActive = false;
                        user.UpdatedAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Report státusza frissítve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) throw new UnauthorizedAccessException("Érvénytelen token");
            return int.Parse(claim.Value);
        }
    }
}