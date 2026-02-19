using OnlyFriends.Data;
using Microsoft.EntityFrameworkCore;
using OnlyFriends.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddScoped<INotificationService, NotificationService>();

// DBsetup
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")?? throw new InvalidOperationException("'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(op => op.UseNpgsql(connectionString));

// Create app
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
