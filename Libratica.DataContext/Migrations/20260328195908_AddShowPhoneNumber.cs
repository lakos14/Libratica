using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Libratica.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class AddShowPhoneNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowPhoneNumber",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowPhoneNumber",
                table: "Users");
        }
    }
}
