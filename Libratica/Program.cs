using Libratica.DataContext.Context;
using Libratica.Services.Implementations;
using Libratica.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Database connection
builder.Services.AddDbContext<LibraticaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed data on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<LibraticaDbContext>();

    context.Database.Migrate();

    var adminExists = context.Users.Any(u => u.Email == "admin@libratica.hu");
    if (!adminExists)
    {
        var adminRole = context.Roles.FirstOrDefault(r => r.Name == "admin");
        if (adminRole != null)
        {
            var adminUser = new Libratica.DataContext.Entities.User
            {
                Email = "admin@libratica.hu",
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                FullName = "Admin User",
                RoleId = adminRole.Id,
                IsVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            context.SaveChanges();
        }
    }

    // Seed books if empty
    var booksExist = context.Books.Any();
    if (!booksExist)
    {
        var sciFiCategory = context.Categories.FirstOrDefault(c => c.Name == "Sci-Fi");
        var fantasyCategory = context.Categories.FirstOrDefault(c => c.Name == "Fantasy");
        var romanticCategory = context.Categories.FirstOrDefault(c => c.Name == "Romantikus");
        var krimiCategory = context.Categories.FirstOrDefault(c => c.Name == "Krimi");
        var ismeretCategory = context.Categories.FirstOrDefault(c => c.Name == "Ismeretterjesztő");
        var tortenelmCategory = context.Categories.FirstOrDefault(c => c.Name == "Történelem");
        var informatikCategory = context.Categories.FirstOrDefault(c => c.Name == "Informatika");
        var gyerekCategory = context.Categories.FirstOrDefault(c => c.Name == "Gyerekkönyv");

        var books = new[]
        {
            // Sci-Fi
            new Libratica.DataContext.Entities.Book
            {
                Title = "Dűne", Author = "Frank Herbert", Publisher = "Gabo Kiadó",
                PublicationYear = 1965, Language = "magyar",
                Description = "Arrakis, a sivatag bolygója, ahol a legértékesebb anyag a fűszer.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8231023-L.jpg", PageCount = 688, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "1984", Author = "George Orwell", Publisher = "Európa Kiadó",
                PublicationYear = 1949, Language = "magyar",
                Description = "Nagy Testvér figyel téged.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8575708-L.jpg", PageCount = 328, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Szép új világ", Author = "Aldous Huxley", Publisher = "Európa Kiadó",
                PublicationYear = 1932, Language = "magyar",
                Description = "Egy disztópikus jövő víziója.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406786-L.jpg", PageCount = 311, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Ender's Game", Author = "Orson Scott Card", Publisher = "Agave Könyvek",
                PublicationYear = 1985, Language = "magyar",
                Description = "Egy gyerekzseni katonai kiképzése egy idegen faj elleni háborúra.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739161-L.jpg", PageCount = 352, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Marsi krónikák", Author = "Ray Bradbury", Publisher = "Szukits Könyvkiadó",
                PublicationYear = 1950, Language = "magyar",
                Description = "Az emberiség Mars kolonizációjának poétikus krónikája.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8408166-L.jpg", PageCount = 268, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Alapítvány", Author = "Isaac Asimov", Publisher = "Szukits Könyvkiadó",
                PublicationYear = 1951, Language = "magyar",
                Description = "Egy galaktikus birodalom összeomlása és újjászületése.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739007-L.jpg", PageCount = 255, CreatedAt = DateTime.UtcNow
            },

            // Fantasy
            new Libratica.DataContext.Entities.Book
            {
                Title = "Harry Potter és a bölcsek köve", Author = "J.K. Rowling", Publisher = "Animus Kiadó",
                PublicationYear = 1997, Language = "magyar",
                Description = "Harry Potter élete a Roxfort falai között.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/10110415-L.jpg", PageCount = 336, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "A Gyűrűk Ura - A Gyűrű Szövetsége", Author = "J.R.R. Tolkien", Publisher = "Európa Kiadó",
                PublicationYear = 1954, Language = "magyar",
                Description = "Egy hobbit útja a végzet hegyéig.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406613-L.jpg", PageCount = 423, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "A Trónok Harca", Author = "George R.R. Martin", Publisher = "Alexandra Kiadó",
                PublicationYear = 1996, Language = "magyar",
                Description = "Westeros nemesi családjainak hatalmi harca.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739195-L.jpg", PageCount = 694, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Az idő kereke - A nagy küldetés kezdete", Author = "Robert Jordan", Publisher = "Beholder Kiadó",
                PublicationYear = 1990, Language = "magyar",
                Description = "Egy epikus fantasy sorozat első kötete.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406550-L.jpg", PageCount = 782, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Narnia krónikái - Az oroszlán, a boszorkány és a ruhásszekrény", Author = "C.S. Lewis", Publisher = "Koinónia Kiadó",
                PublicationYear = 1950, Language = "magyar",
                Description = "Négy gyerek kalandjai a varázslatos Narniában.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406551-L.jpg", PageCount = 208, CreatedAt = DateTime.UtcNow
            },

            // Romantikus
            new Libratica.DataContext.Entities.Book
            {
                Title = "Büszkeség és balítélet", Author = "Jane Austen", Publisher = "Európa Kiadó",
                PublicationYear = 1813, Language = "magyar",
                Description = "Elizabeth Bennet és Mr. Darcy szerelmi története.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739161-L.jpg", PageCount = 432, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Jane Eyre", Author = "Charlotte Brontë", Publisher = "Európa Kiadó",
                PublicationYear = 1847, Language = "magyar",
                Description = "Egy árva lány felemelkedése és szerelme.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406790-L.jpg", PageCount = 507, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "A nagy Gatsby", Author = "F. Scott Fitzgerald", Publisher = "Európa Kiadó",
                PublicationYear = 1925, Language = "magyar",
                Description = "Az amerikai álom és a szerelem tragikus történet.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406791-L.jpg", PageCount = 180, CreatedAt = DateTime.UtcNow
            },

            // Krimi
            new Libratica.DataContext.Entities.Book
            {
                Title = "A Sherlock Holmes kalandjai", Author = "Arthur Conan Doyle", Publisher = "Európa Kiadó",
                PublicationYear = 1892, Language = "magyar",
                Description = "A legendás detektív leghíresebb esetei.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406792-L.jpg", PageCount = 307, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "A Níluson úszó halál", Author = "Agatha Christie", Publisher = "Európa Kiadó",
                PublicationYear = 1937, Language = "magyar",
                Description = "Hercule Poirot nyomoz egy Nílus-parti gyilkosságban.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406793-L.jpg", PageCount = 288, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "A lány a vonaton", Author = "Paula Hawkins", Publisher = "Animus Kiadó",
                PublicationYear = 2015, Language = "magyar",
                Description = "Egy pszichológiai thriller egy eltűnt nőről.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739200-L.jpg", PageCount = 395, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Inferno", Author = "Dan Brown", Publisher = "Gabo Kiadó",
                PublicationYear = 2013, Language = "magyar",
                Description = "Robert Langdon Dante nyomában Firenzében.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739201-L.jpg", PageCount = 463, CreatedAt = DateTime.UtcNow
            },

            // Ismeretterjesztő
            new Libratica.DataContext.Entities.Book
            {
                Title = "Sapiens - Az emberiség rövid története", Author = "Yuval Noah Harari", Publisher = "Animus Kiadó",
                PublicationYear = 2011, Language = "magyar",
                Description = "Az emberiség evolúciójának és fejlődésének átfogó bemutatása.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739202-L.jpg", PageCount = 443, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Homo Deus - A holnap rövid története", Author = "Yuval Noah Harari", Publisher = "Animus Kiadó",
                PublicationYear = 2015, Language = "magyar",
                Description = "Az emberiség jövőjének víziója.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8739203-L.jpg", PageCount = 450, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Rövid történet mindenről", Author = "Bill Bryson", Publisher = "Park Kiadó",
                PublicationYear = 2003, Language = "magyar",
                Description = "A tudomány legfontosabb felfedezéseinek izgalmas összefoglalója.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406800-L.jpg", PageCount = 544, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "A világ rövid története", Author = "H.G. Wells", Publisher = "Helikon Kiadó",
                PublicationYear = 1922, Language = "magyar",
                Description = "Az emberiség történelmének összefoglalója.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406801-L.jpg", PageCount = 320, CreatedAt = DateTime.UtcNow
            },

            // Történelem
            new Libratica.DataContext.Entities.Book
            {
                Title = "A második világháború", Author = "Antony Beevor", Publisher = "Európa Kiadó",
                PublicationYear = 2012, Language = "magyar",
                Description = "A második világháború átfogó és részletes bemutatása.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406802-L.jpg", PageCount = 880, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Sztálingrád", Author = "Antony Beevor", Publisher = "Európa Kiadó",
                PublicationYear = 1998, Language = "magyar",
                Description = "A sztálingrádi csata részletes története.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406803-L.jpg", PageCount = 490, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Magyarország történelme", Author = "Romsics Ignác", Publisher = "Osiris Kiadó",
                PublicationYear = 2010, Language = "magyar",
                Description = "Magyarország történelmének átfogó összefoglalója.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406804-L.jpg", PageCount = 650, CreatedAt = DateTime.UtcNow
            },

            // Informatika
            new Libratica.DataContext.Entities.Book
            {
                Title = "Clean Code", Author = "Robert C. Martin", Publisher = "Prentice Hall",
                PublicationYear = 2008, Language = "angol",
                Description = "A tiszta kód írásának alapelvei és gyakorlatai.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406805-L.jpg", PageCount = 431, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "The Pragmatic Programmer", Author = "David Thomas, Andrew Hunt", Publisher = "Addison-Wesley",
                PublicationYear = 1999, Language = "angol",
                Description = "A pragmatikus programozó útmutatója.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406806-L.jpg", PageCount = 352, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Design Patterns", Author = "Gang of Four", Publisher = "Addison-Wesley",
                PublicationYear = 1994, Language = "angol",
                Description = "Az objektumorientált tervezési minták klasszikus gyűjteménye.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406807-L.jpg", PageCount = 395, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Programozás C# nyelven", Author = "Nyékyné Gaizler Judit", Publisher = "Szak Kiadó",
                PublicationYear = 2013, Language = "magyar",
                Description = "A C# programozási nyelv részletes bemutatása.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406808-L.jpg", PageCount = 820, CreatedAt = DateTime.UtcNow
            },

            // Gyerekkönyv
            new Libratica.DataContext.Entities.Book
            {
                Title = "A kis herceg", Author = "Antoine de Saint-Exupéry", Publisher = "Móra Kiadó",
                PublicationYear = 1943, Language = "magyar",
                Description = "Egy kis herceg kalandjai a bolygók között.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406809-L.jpg", PageCount = 96, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Pippi Hosszaharisnya", Author = "Astrid Lindgren", Publisher = "Móra Kiadó",
                PublicationYear = 1945, Language = "magyar",
                Description = "A világ legerősebb kislányának kalandjai.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406810-L.jpg", PageCount = 160, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Winnie-the-Pooh", Author = "A.A. Milne", Publisher = "Móra Kiadó",
                PublicationYear = 1926, Language = "magyar",
                Description = "Micimackó és barátainak kalandjai.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406811-L.jpg", PageCount = 176, CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                Title = "Roald Dahl összegyűjtött meséi", Author = "Roald Dahl", Publisher = "Móra Kiadó",
                PublicationYear = 1995, Language = "magyar",
                Description = "Roald Dahl legjobb gyerekmeséinek gyűjteménye.",
                CoverImageUrl = "https://covers.openlibrary.org/b/id/8406812-L.jpg", PageCount = 320, CreatedAt = DateTime.UtcNow
            },
        };

        context.Books.AddRange(books);
        context.SaveChanges();

        // Kategóriák hozzárendelése
        var bookCategories = new List<Libratica.DataContext.Entities.BookCategory>();

        // Sci-Fi könyvek (0-5)
        if (sciFiCategory != null)
            for (int i = 0; i <= 5; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = sciFiCategory.Id });

        // Fantasy könyvek (6-10)
        if (fantasyCategory != null)
            for (int i = 6; i <= 10; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = fantasyCategory.Id });

        // Romantikus könyvek (11-13)
        if (romanticCategory != null)
            for (int i = 11; i <= 13; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = romanticCategory.Id });

        // Krimi könyvek (14-17)
        if (krimiCategory != null)
            for (int i = 14; i <= 17; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = krimiCategory.Id });

        // Ismeretterjesztő könyvek (18-21)
        if (ismeretCategory != null)
            for (int i = 18; i <= 21; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = ismeretCategory.Id });

        // Történelem könyvek (22-24)
        if (tortenelmCategory != null)
            for (int i = 22; i <= 24; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = tortenelmCategory.Id });

        // Informatika könyvek (25-28)
        if (informatikCategory != null)
            for (int i = 25; i <= 28; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = informatikCategory.Id });

        // Gyerekkönyvek (29-32)
        if (gyerekCategory != null)
            for (int i = 29; i <= 32; i++)
                bookCategories.Add(new Libratica.DataContext.Entities.BookCategory { BookId = books[i].Id, CategoryId = gyerekCategory.Id });

        context.BookCategories.AddRange(bookCategories);
        context.SaveChanges();

        // Hirdetések létrehozása az admin usernek
        var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@libratica.hu");
        if (adminUser != null)
        {
            var random = new Random();
            var conditions = new[] { "mint", "excellent", "good", "fair", "poor" };
            var locations = new[] { "Budapest, XIII. kerület", "Budapest, XI. kerület", "Debrecen", "Pécs", "Győr", "Miskolc", "Szeged", "Székesfehérvár", "Veszprém", "Szombathely" };

            var listings = books.Select(book => new Libratica.DataContext.Entities.Listing
            {
                BookId = book.Id,
                SellerId = adminUser.Id,
                Condition = conditions[random.Next(conditions.Length)],
                Price = random.Next(5, 30) * 100,
                Currency = "HUF",
                Quantity = random.Next(1, 4),
                IsAvailable = true,
                Location = locations[random.Next(locations.Length)],
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 60)),
                UpdatedAt = DateTime.UtcNow
            }).ToArray();

            context.Listings.AddRange(listings);
            context.SaveChanges();
        }

        Console.WriteLine("Seed books complete!");
    }

    Console.WriteLine("Development seed data complete!");
}

app.Run();