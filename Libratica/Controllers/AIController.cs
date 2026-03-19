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

        /// <summary>
        /// Természetes nyelvi keresés AI segítségével
        /// </summary>
        [HttpPost("search")]
        public async Task<ActionResult> AISearch([FromBody] AISearchDto dto)
        {
            try
            {
                var apiKey = _configuration["OpenAI:ApiKey"];
                var client = new ChatClient("gpt-3.5-turbo", apiKey);

                var prompt = $@"
                A felhasználó egy használt könyveket áruló magyar piactéren keres könyvet.
                A felhasználó keresése: ""{dto.Query}""

                Elemezd a keresést és adj vissza egy JSON objektumot az alábbi mezőkkel:
                - keywords: string (csak a legfontosabb 1-3 szó, pl. szerző neve vagy könyv témája, NE az egész mondat)
                - category: string (ha felismerhető: Sci-Fi, Fantasy, Romantikus, Krimi, Ismeretterjesztő, Történelem, Informatika, Gyerekkönyv - vagy null)
                - minPrice: number vagy null
                - maxPrice: number vagy null  
                - condition: string (mint, excellent, good, fair, poor) vagy null

                Fontos: a keywords mező csak rövid kulcsszavakat tartalmazzon, ne mondatokat!
                Csak a JSON objektumot add vissza, semmi mást!
                Példa: {{""keywords"": ""Rowling"", ""category"": ""Fantasy"", ""minPrice"": null, ""maxPrice"": null, ""condition"": null}}";

                var response = await client.CompleteChatAsync(prompt);
                var content = response.Value.Content[0].Text;

                // JSON parse
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