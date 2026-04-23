using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Libratica.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class RenameGoogleBooksIdToOpenLibraryId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GoogleBooksId",
                table: "BookCollections",
                newName: "OpenLibraryId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OpenLibraryId",
                table: "BookCollections",
                newName: "GoogleBooksId");
        }
    }
}
