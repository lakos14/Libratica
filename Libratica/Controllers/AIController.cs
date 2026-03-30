using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using System.Text.Json;

namespace Libratica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AIController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        //Természetes nyelvi keresés AI segítségével
        [HttpPost("search")]
        public async Task<ActionResult> AISearch([FromBody] AISearchDto dto)
        {
            try
            {
                var apiKey = _configuration["OpenAI:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                    return BadRequest(new { message = "AI keresés jelenleg nem elérhető" });

                var client = new ChatClient("gpt-3.5-turbo", apiKey);

                var prompt = $@"
                A felhasználó egy használt könyveket áruló magyar piactéren keres könyvet.
                A felhasználó keresése: ""{dto.Query}""

                Elemezd a keresést és adj vissza egy JSON objektumot az alábbi mezőkkel:
                - keywords: string (csak 1-2 legfontosabb szó a témából, pl. 'emberiség', 'Harry Potter', 'programozás' - NE teljes mondatot!)
                - category: string (ha felismerhető: Sci-Fi, Fantasy, Romantikus, Krimi, Ismeretterjesztő, Történelem, Informatika, Gyerekkönyv - vagy null)
                - minPrice: number vagy null
                - maxPrice: number vagy null  
                - condition: CSAK ezek egyike lehet: mint, excellent, good, fair, poor - vagy null. SOHA ne adj vissza magyar szót!

                Fontos szabályok:
                - keywords legyen minél rövidebb, csak 1-2 szó!
                - Ha szerző nevét ismered fel, csak a vezetéknevét add vissza (pl. 'Rowling', 'Orwell', 'Harari')
                - Ha témát ismersz fel, csak a legfontosabb főnevet add vissza (pl. 'emberiség', 'programozás', 'sárkány')

                Csak a JSON objektumot add vissza, semmi mást!
                Példa: {{""keywords"": ""emberiség"", ""category"": ""Történelem"", ""minPrice"": null, ""maxPrice"": null, ""condition"": null}}";

                var response = await client.CompleteChatAsync(prompt);
                var content = response.Value.Content[0].Text;

                var result = JsonSerializer.Deserialize<AISearchResult>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class AISearchDto
    {
        public string Query { get; set; } = string.Empty;
    }

    public class AISearchResult
    {
        public string? Keywords { get; set; }
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Condition { get; set; }
    }
}