using Libratica.DataContext.Entities;
using Microsoft.EntityFrameworkCore;

namespace Libratica.DataContext.Context
{
    public class LibraticaDbContext : DbContext
    {
        public LibraticaDbContext(DbContextOptions<LibraticaDbContext> options)
            : base(options)
        {
        }

        // DbSets - ezek lesznek a táblák
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<BookCategory> BookCategories { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Role configuration
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();

                entity.HasOne(u => u.Role)
                    .WithMany(r => r.Users)
                    .HasForeignKey(u => u.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(u => u.Listings)
                    .WithOne(l => l.Seller)
                    .HasForeignKey(l => l.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(u => u.OrdersAsBuyer)
                    .WithOne(o => o.Buyer)
                    .HasForeignKey(o => o.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(u => u.OrdersAsSeller)
                    .WithOne(o => o.Seller)
                    .HasForeignKey(o => o.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(u => u.ReviewsWritten)
                    .WithOne(r => r.Reviewer)
                    .HasForeignKey(r => r.ReviewerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(u => u.ReviewsReceived)
                    .WithOne(r => r.ReviewedUser)
                    .HasForeignKey(r => r.ReviewedUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name);

                entity.HasOne(c => c.ParentCategory)
                    .WithMany(c => c.SubCategories)
                    .HasForeignKey(c => c.ParentCategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Book configuration
            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ISBN);
                entity.HasIndex(e => e.Title);
                entity.HasIndex(e => e.Author);
            });

            // BookCategory configuration
            modelBuilder.Entity<BookCategory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.BookId, e.CategoryId }).IsUnique();

                entity.HasOne(bc => bc.Book)
                    .WithMany(b => b.BookCategories)
                    .HasForeignKey(bc => bc.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(bc => bc.Category)
                    .WithMany(c => c.BookCategories)
                    .HasForeignKey(bc => bc.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Listing configuration
            modelBuilder.Entity<Listing>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.BookId);
                entity.HasIndex(e => e.SellerId);
                entity.HasIndex(e => e.IsAvailable);
                entity.HasIndex(e => e.CreatedAt);

                entity.HasOne(l => l.Book)
                    .WithMany(b => b.Listings)
                    .HasForeignKey(l => l.BookId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.BuyerId);
                entity.HasIndex(e => e.SellerId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Listing)
                    .WithMany(l => l.OrderItems)
                    .HasForeignKey(oi => oi.ListingId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Review configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.ReviewedUserId);

                entity.HasOne(r => r.Order)
                    .WithMany(o => o.Reviews)
                    .HasForeignKey(r => r.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            // Seed reference data
            SeedReferenceData(modelBuilder);
        }
        private void SeedReferenceData(ModelBuilder modelBuilder)
        {
            // Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "user" },
                new Role { Id = 2, Name = "admin" }
            );

            // Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Sci-Fi", Description = "Tudományos-fantasztikus regények", CreatedAt = new DateTime(2024, 1, 1) },
                new Category { Id = 2, Name = "Fantasy", Description = "Fantasy és varázslatos történetek", CreatedAt = new DateTime(2024, 1, 1) },
                new Category { Id = 3, Name = "Romantikus", Description = "Romantikus regények", CreatedAt = new DateTime(2024, 1, 1) },
                new Category { Id = 4, Name = "Krimi", Description = "Krimi és thriller", CreatedAt = new DateTime(2024, 1, 1) },
                new Category { Id = 5, Name = "Ismeretterjesztő", Description = "Tudományos és ismeretterjesztő könyvek", CreatedAt = new DateTime(2024, 1, 1) },
                new Category { Id = 6, Name = "Történelem", Description = "Történelmi könyvek", CreatedAt = new DateTime(2024, 1, 1) },
                new Category { Id = 7, Name = "Informatika", Description = "Programozás és IT", CreatedAt = new DateTime(2024, 1, 1) },
                new Category { Id = 8, Name = "Gyerekkönyv", Description = "Gyermekeknek szóló könyvek", CreatedAt = new DateTime(2024, 1, 1) }
            );
        }
    }
}