using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        [MinLength(6, ErrorMessage = "Minimum 6 karakter")]
        public string Password { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FullName { get; set; }

        [Phone(ErrorMessage = "Érvénytelen telefonszám")]
        public string? PhoneNumber { get; set; }
    }
}
