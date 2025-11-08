using Libratica.Services.Interfaces;
using Libratica.Services.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Libratica.DataContext.Context;
using Libratica.DataContext.Entities;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<LibraticaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

builder.Services.AddAuthorization();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Libratica API",
        Version = "v1",
        Description = "Használt könyvek piactere API"
    });

    // JWT Bearer konfiguráció Swagger-hez
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1NiIsInR5...\""
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<LibraticaDbContext>();
        await SeedDevelopmentDataAsync(context);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

async Task SeedDevelopmentDataAsync(LibraticaDbContext context)
{
    try
    {
        await context.Database.MigrateAsync();
        if (!await context.Users.AnyAsync(u => u.Email == "admin@libratica.hu"))
        {
            var adminUser = new User
            {
                Email = "admin@libratica.hu",
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                FullName = "Admin Felhasználó",
                PhoneNumber = "+36301234567",
                RoleId = 2,
                IsVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
            Console.WriteLine("Admin user created: admin@libratica.hu / Admin123!");
        }

        if (!await context.Books.AnyAsync())
        {
            var books = new List<Book>
            {
                new Book
                {
                    Title = "Dûne",
                    Author = "Frank Herbert",
                    ISBN = "9789632451234",
                    Publisher = "Szukits Könyvkiadó",
                    PublicationYear = 1965,
                    Language = "magyar",
                    Description = "Az emberiség jövõjérõl szóló epikus sci-fi regény, amely a Dûne nevû sivatagi bolygón játszódik.",
                    PageCount = 704,
                    CoverImageUrl = "https://s01.static.libri.hu/cover/30/0/1370030_5.jpg",
                    CreatedAt = DateTime.UtcNow
                },
                new Book
                {
                    Title = "1984",
                    Author = "George Orwell",
                    ISBN = "9789631234567",
                    Publisher = "Európa Könyvkiadó",
                    PublicationYear = 1949,
                    Language = "magyar",
                    Description = "Disztópikus regény egy totalitárius jövõrõl, ahol a Nagy Testvér mindent lát.",
                    PageCount = 328,
                    CoverImageUrl = "https://s01.static.libri.hu/cover/b3/5/8962135_5.jpg",
                    CreatedAt = DateTime.UtcNow
                },
                new Book
                {
                    Title = "Harry Potter és a bölcsek köve",
                    Author = "J.K. Rowling",
                    ISBN = "9789633245712",
                    Publisher = "Animus Kiadó",
                    PublicationYear = 1997,
                    Language = "magyar",
                    Description = "Harry Potter élete gyökeresen megváltozik 11. születésnapján, amikor megtudja, hogy varázsló.",
                    PageCount = 368,
                    CoverImageUrl = "https://s01.static.libri.hu/cover/6f/2/1337726f_5.jpg",
                    CreatedAt = DateTime.UtcNow
                }
            };
            await context.Books.AddRangeAsync(books);
            await context.SaveChangesAsync();
            Console.WriteLine($"{books.Count} test books created!");
            var bookCategories = new List<BookCategory>
            {
                new BookCategory { BookId = 1, CategoryId = 1 },
                new BookCategory { BookId = 2, CategoryId = 1 },
                new BookCategory { BookId = 3, CategoryId = 2 }
            };
            await context.BookCategories.AddRangeAsync(bookCategories);
            await context.SaveChangesAsync();
        }

        Console.WriteLine("Development seed data complete!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding data: {ex.Message}");
    }
}