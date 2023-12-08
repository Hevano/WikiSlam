using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WikiSlam.Migrations
{
    /// <inheritdoc />
    public partial class TimestampToLong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RoundStartTimestamp",
                table: "Lobbies");

            migrationBuilder.DropColumn(
                name: "CreationTimestamp",
                table: "Lobbies");

            migrationBuilder.AddColumn<string>(
                name: "RoundStartTimestamp",
                table: "Lobbies",
                type: "bigint",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CreationTimestamp",
                table: "Lobbies",
                type: "bigint",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "RoundStartTimestamp",
                table: "Lobbies",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreationTimestamp",
                table: "Lobbies",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");
        }
    }
}
