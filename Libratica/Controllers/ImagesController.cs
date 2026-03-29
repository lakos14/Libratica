using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ImagesController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public ImagesController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        //Kép feltöltése
        [HttpPost("upload")]
        public async Task<ActionResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "Nincs fájl kiválasztva" });

                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(new { message = "A fájl mérete maximum 5MB lehet" });

                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { message = "Csak JPG, PNG és WEBP formátum engedélyezett" });

                var uploadPath = Path.Combine(_environment.WebRootPath, "images", "listings");
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var imageUrl = $"/images/listings/{fileName}";
                return Ok(new { url = imageUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //Kép törlése
        [HttpDelete]
        [Authorize]
        public ActionResult DeleteImage([FromQuery] string url)
        {
            try
            {
                if (string.IsNullOrEmpty(url))
                    return BadRequest(new { message = "URL kötelező" });

                var filePath = Path.Combine(_environment.WebRootPath, url.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);

                return Ok(new { message = "Kép törölve" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}