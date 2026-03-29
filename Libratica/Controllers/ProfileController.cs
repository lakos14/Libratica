using Libratica.DataContext.Context;
using Libratica.DataContext.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : BaseController
    {
        private readonly LibraticaDbContext _context;

        public ProfileController(LibraticaDbContext context)
        {
            _context = context;
        }

        [HttpPut]
        public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return NotFound(new { message = "Felhasználó nem található" });

                if (dto.Username != null && dto.Username != user.Username)
                {
                    if (await _context.Users.AnyAsync(u => u.Username == dto.Username && u.Id != userId))
                        return BadRequest(new { message = "Ez a felhasználónév már foglalt." });
                    user.Username = dto.Username;
                }

                if (dto.FullName != null) user.FullName = dto.FullName;
                if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
                if (dto.ShowPhoneNumber.HasValue) user.ShowPhoneNumber = dto.ShowPhoneNumber.Value;

                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    RoleName = user.Role.Name,
                    Rating = user.Rating,
                    CreatedAt = user.CreatedAt,
                    ShowPhoneNumber = user.ShowPhoneNumber,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound(new { message = "Felhasználó nem található" });

                if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                    return BadRequest(new { message = "Hibás jelenlegi jelszó." });

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Jelszó sikeresen megváltoztatva!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}