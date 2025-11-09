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

// CORS configuration ? ÚJ!
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

app.UseCors("AllowFrontend"); // ? ÚJ! (FONTOS: Authorization ELÕTT!)

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed data on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<LibraticaDbContext>();

    // Run migrations
    context.Database.Migrate();

    // Seed admin user
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

        var books = new[]
        {
            new Libratica.DataContext.Entities.Book
            {
                ISBN = "9789632451234",
                Title = "Dûne",
                Author = "Frank Herbert",
                Publisher = "Gabo Kiadó",
                PublicationYear = 1965,
                Language = "magyar",
                Description = "Arrakis, a sivatag bolygója...",
                PageCount = 688,
                CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                ISBN = "9789631199437",
                Title = "1984",
                Author = "George Orwell",
                Publisher = "Európa Kiadó",
                PublicationYear = 1949,
                Language = "magyar",
                Description = "Nagy Testvér figyel...",
                PageCount = 328,
                CreatedAt = DateTime.UtcNow
            },
            new Libratica.DataContext.Entities.Book
            {
                ISBN = "9789633245446",
                Title = "Harry Potter és a bölcsek köve",
                Author = "J.K. Rowling",
                Publisher = "Animus Kiadó",
                PublicationYear = 1997,
                Language = "magyar",
                Description = "Harry Potter élete a Roxfort falai között...",
                PageCount = 336,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Books.AddRange(books);
        context.SaveChanges();

        // Add categories to books
        if (sciFiCategory != null)
        {
            context.BookCategories.AddRange(
                new Libratica.DataContext.Entities.BookCategory { BookId = books[0].Id, CategoryId = sciFiCategory.Id },
                new Libratica.DataContext.Entities.BookCategory { BookId = books[1].Id, CategoryId = sciFiCategory.Id }
            );
        }

        if (fantasyCategory != null)
        {
            context.BookCategories.Add(
                new Libratica.DataContext.Entities.BookCategory { BookId = books[2].Id, CategoryId = fantasyCategory.Id }
            );
        }

        context.SaveChanges();

        // Create listings
        var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@libratica.hu");
        if (adminUser != null)
        {
            var listings = new[]
            {
                new Libratica.DataContext.Entities.Listing
                {
                    BookId = books[0].Id,
                    SellerId = adminUser.Id,
                    Condition = "good",
                    ConditionDescription = "Jó állapotban, minimális kopás",
                    Price = 2500,
                    Currency = "HUF",
                    Quantity = 1,
                    IsAvailable = true,
                    Location = "Budapest, XIII. kerület",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Libratica.DataContext.Entities.Listing
                {
                    BookId = books[1].Id,
                    SellerId = adminUser.Id,
                    Condition = "excellent",
                    ConditionDescription = "Kiváló állapot",
                    Price = 1800,
                    Currency = "HUF",
                    Quantity = 2,
                    IsAvailable = true,
                    Location = "Debrecen",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Listings.AddRange(listings);
            context.SaveChanges();
        }
    }

    Console.WriteLine("Development seed data complete!");
}

app.Run();