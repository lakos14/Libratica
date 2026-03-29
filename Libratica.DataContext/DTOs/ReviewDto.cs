namespace Libratica.DataContext.DTOs
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public UserDto Reviewer { get; set; } = null!;
        public UserDto ReviewedUser { get; set; } = null!;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}