using OnlyFriends.Data;
using Microsoft.EntityFrameworkCore;
using OnlyFriends.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Cryptography;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Mapster;
using EntityFramework.Exceptions.PostgreSQL; // For the .UseExceptionProcessor() method

var builder = WebApplication.CreateBuilder(args);

// Ignore null values for mapster
TypeAdapterConfig.GlobalSettings.Default
    .IgnoreNullValues(true);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddTransient<IEventService, EventService>();
builder.Services.AddTransient<ICategoryService, CategoryService>();

// Register Postgresql
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("DefaultConnection not found in configuration");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString).UseExceptionProcessor());

var issuer = builder.Configuration["Jwt:Issuer"] ?? "OnlyFriends";
var audience = builder.Configuration["Jwt:Audience"] ?? "OnlyFriends";
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey) && builder.Environment.IsDevelopment())
{
    jwtKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
}
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT key not configured");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token))
                {
                    if (context.Request.Cookies.TryGetValue("AuthToken", out var tokenFromCookie))
                    {
                        context.Token = tokenFromCookie;
                    }
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization(options =>
{
});

// Create app
var app = builder.Build();


if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseStaticFiles(); // <--- Add this back!
app.UseRouting();

app.MapStaticAssets();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Hero}/{action=Heropage}/{id?}")
    .WithStaticAssets();

app.Run();
