using System.ComponentModel.DataAnnotations;

namespace Libratica.DataContext.DTOs
{
    public class UpdateProfileDto
    {
        [MaxLength(50)]
        public string? Username { get; set; }

        [MaxLength(100)]
        public string? FullName { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        public bool? ShowPhoneNumber { get; set; }
    }

}