namespace Libratica.DataContext.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public decimal? Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool ShowPhoneNumber { get; set; }
    }
}