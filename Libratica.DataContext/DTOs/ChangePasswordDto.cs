using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Jelenlegi jelszó kötelező")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Új jelszó kötelező")]
        [MinLength(6, ErrorMessage = "Minimum 6 karakter")]
        public string NewPassword { get; set; } = string.Empty;
    }
}