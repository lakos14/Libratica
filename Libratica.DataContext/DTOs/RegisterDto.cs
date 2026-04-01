using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Email kötelező")]
        [EmailAddress(ErrorMessage = "Érvénytelen email cím")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Felhasználónév kötelező")]
        [MinLength(3, ErrorMessage = "Minimum 3 karakter")]
        [MaxLength(50, ErrorMessage = "Maximum 50 karakter")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Jelszó kötelező")]
        [MinLength(8, ErrorMessage = "Minimum 8 karakter")]
        public string Password { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FullName { get; set; }

        public string? PhoneNumber { get; set; }
    }
}
