using Libratica.DataContext.DTOs;
using Libratica.DataContext.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Libratica.Controllers
{
    public class BaseController : ControllerBase
    {
        protected int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) throw new UnauthorizedAccessException("Érvénytelen token");
            return int.Parse(claim.Value);
        }

        protected ListingDto MapToListingDto(Listing listing)
        {
            return new ListingDto
            {
                Id = listing.Id,
                Book = new BookDto
                {
                    Id = listing.Book.Id,
                    ISBN = listing.Book.ISBN,
                    Title = listing.Book.Title,
                    Author = listing.Book.Author,
                    Publisher = listing.Book.Publisher,
                    PublicationYear = listing.Book.PublicationYear,
                    Language = listing.Book.Language,
                    Description = listing.Book.Description,
                    CoverImageUrl = listing.Book.CoverImageUrl,
                    PageCount = listing.Book.PageCount,
                    Categories = listing.Book.BookCategories.Select(bc => new CategoryDto
                    {
                        Id = bc.Category.Id,
                        Name = bc.Category.Name,
                        Description = bc.Category.Description
                    }).ToList(),
                    CreatedAt = listing.Book.CreatedAt
                },
                Seller = new UserDto
                {
                    Id = listing.Seller.Id,
                    Username = listing.Seller.Username,
                    Email = listing.Seller.Email,
                    FullName = listing.Seller.FullName,
                    RoleName = listing.Seller.Role.Name,
                    Rating = listing.Seller.Rating,
                    CreatedAt = listing.Seller.CreatedAt
                },
                Condition = listing.Condition,
                ConditionDescription = listing.ConditionDescription,
                Price = listing.Price,
                Quantity = listing.Quantity,
                IsAvailable = listing.IsAvailable,
                Location = listing.Location,
                Images = !string.IsNullOrEmpty(listing.Images)
                    ? JsonSerializer.Deserialize<List<string>>(listing.Images) ?? new List<string>()
                    : new List<string>(),
                CreatedAt = listing.CreatedAt,
                UpdatedAt = listing.UpdatedAt
            };
        }
    }
}