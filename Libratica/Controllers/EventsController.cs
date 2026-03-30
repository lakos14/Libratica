using Libratica.DataContext.Context;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Libratica.DataContext.DTOs;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public EventsController(LibraticaDbContext context)
        {
            _context = context;
        }

        //Összes jóváhagyott esemény lekérése
        [HttpGet]
        public async Task<ActionResult> GetEvents()
        {
            try
            {
                var events = await _context.Events
                    .Include(e => e.Organizer)
                    .Include(e => e.Attendees)
                    .Include(e => e.Comments)
                    .Where(e => e.Status == "approved")
                    .OrderBy(e => e.EventDate < DateTime.UtcNow)
                    .ThenBy(e => e.EventDate)
                    .Select(e => new
                    {
                        e.Id,
                        e.Title,
                        e.Description,
                        e.Type,
                        e.EventDate,
                        e.Location,
                        e.Status,
                        e.CreatedAt,
                        IsExpired = e.EventDate < DateTime.UtcNow,
                        Organizer = new { e.Organizer.Id, e.Organizer.Username },
                        Attendees = e.Attendees.Select(a => new { a.UserId }),
                        AttendeesCount = e.Attendees.Count,
                        CommentsCount = e.Comments.Count

                    })
                    .ToListAsync();

                return Ok(events);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Egy esemény részletei
        [HttpGet("{id}")]
        public async Task<ActionResult> GetEvent(int id)
        {
            try
            {
                var e = await _context.Events
                    .Include(ev => ev.Organizer)
                    .Include(ev => ev.Attendees).ThenInclude(a => a.User)
                    .Include(ev => ev.Comments).ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(ev => ev.Id == id);

                if (e == null)
                    return NotFound(new { message = "Esemény nem található" });

                return Ok(new
                {
                    e.Id,
                    e.Title,
                    e.Description,
                    e.Type,
                    e.EventDate,
                    e.Location,
                    e.Status,
                    e.CreatedAt,
                    e.Latitude,
                    e.Longitude,
                    Organizer = new { e.Organizer.Id, e.Organizer.Username },
                    Attendees = e.Attendees.Select(a => new { a.User.Id, a.User.Username }),
                    Comments = e.Comments.OrderByDescending(c => c.CreatedAt).Select(c => new
                    {
                        c.Id,
                        c.Content,
                        c.CreatedAt,
                        User = new { c.User.Id, c.User.Username }
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Új esemény létrehozása
        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var newEvent = new Event
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    Type = dto.Type,
                    EventDate = dto.EventDate.Kind == DateTimeKind.Unspecified
                        ? DateTime.SpecifyKind(dto.EventDate, DateTimeKind.Local).ToUniversalTime()
                        : dto.EventDate.ToUniversalTime(),
                    Location = dto.Location,
                    Status = "pending",
                    OrganizerId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                };

                _context.Events.Add(newEvent);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Esemény létrehozva, admin jóváhagyásra vár!", id = newEvent.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Részvételi szándék jelzése / visszavonása
        [HttpPost("{id}/attend")]
        [Authorize]
        public async Task<ActionResult> ToggleAttend(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var eventExists = await _context.Events.AnyAsync(e => e.Id == id && e.Status == "approved");
                if (!eventExists)
                    return NotFound(new { message = "Esemény nem található" });

                var existing = await _context.EventAttendees
                    .FirstOrDefaultAsync(ea => ea.EventId == id && ea.UserId == userId);

                if (existing != null)
                {
                    _context.EventAttendees.Remove(existing);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Részvételi szándék visszavonva", attending = false });
                }
                else
                {
                    _context.EventAttendees.Add(new EventAttendee
                    {
                        EventId = id,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Részvételi szándék jelezve!", attending = true });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Komment hozzáadása
        [HttpPost("{id}/comments")]
        [Authorize]
        public async Task<ActionResult> AddComment(int id, [FromBody] CreateEventCommentDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var eventExists = await _context.Events.AnyAsync(e => e.Id == id && e.Status == "approved");
                if (!eventExists)
                    return NotFound(new { message = "Esemény nem található" });

                var comment = new EventComment
                {
                    EventId = id,
                    UserId = userId,
                    Content = dto.Content,
                    CreatedAt = DateTime.UtcNow
                };

                _context.EventComments.Add(comment);
                await _context.SaveChangesAsync();

                var user = await _context.Users.FindAsync(userId);

                return Ok(new
                {
                    comment.Id,
                    comment.Content,
                    comment.CreatedAt,
                    User = new { user!.Id, user.Username }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Komment törlése
        [HttpDelete("{id}/comments/{commentId}")]
        [Authorize]
        public async Task<ActionResult> DeleteComment(int id, int commentId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var comment = await _context.EventComments
                    .FirstOrDefaultAsync(c => c.Id == commentId && c.EventId == id);

                if (comment == null)
                    return NotFound(new { message = "Komment nem található" });

                if (comment.UserId != userId && userRole != "admin")
                    return Forbid();

                _context.EventComments.Remove(comment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Komment törölve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Saját események lekérése
        [HttpGet("my-events")]
        [Authorize]
        public async Task<ActionResult> GetMyEvents()
        {
            try
            {
                var userId = GetCurrentUserId();

                var events = await _context.Events
                    .Include(e => e.Attendees)
                    .Where(e => e.OrganizerId == userId)
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
    }
}