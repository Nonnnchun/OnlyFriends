using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onlyfriends.Migrations
{
    /// <inheritdoc />
    public partial class Siwakorn4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Notification",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "FromUserId",
                table: "Notification",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "Notification",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ToUserId",
                table: "Notification",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Notification",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "FromUserId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "Message",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "ToUserId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Notification");
        }
    }
}
