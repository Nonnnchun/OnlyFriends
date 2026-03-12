using OnlyFriends.Data;
using Microsoft.EntityFrameworkCore;
using OnlyFriends.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Cryptography;
using System.Security.Claims;
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
builder.Services.AddHostedService<EventReminderBackgroundService>();

// Register Postgresql
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("DefaultConnection not found in configuration");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString).UseExceptionProcessor().EnableSensitiveDataLogging().EnableDetailedErrors());       // Provides better stack traces);


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

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInit");
    try
    {
        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            await dbContext.Database.MigrateAsync();
        }
        else
        {
            logger.LogInformation("No pending migrations.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database migration failed.");
    }

    if (app.Environment.IsDevelopment() && !TableExists(dbContext, "\"Events\""))
    {
        logger.LogWarning("Table \"Events\" is missing. Recreating Development database from current model.");
        dbContext.Database.EnsureDeleted();
        dbContext.Database.EnsureCreated();
    }
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Hero}/{action=Heropage}/{id?}")
    .WithStaticAssets();

app.MapStaticAssets();

app.Run();

static bool TableExists(ApplicationDbContext dbContext, string relationName)
{
    var connection = dbContext.Database.GetDbConnection();
    var shouldClose = connection.State != System.Data.ConnectionState.Open;
    if (shouldClose)
    {
        connection.Open();
    }

    try
    {
        using var command = connection.CreateCommand();
        command.CommandText = "SELECT to_regclass(@name) IS NOT NULL;";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "@name";
        parameter.Value = relationName;
        command.Parameters.Add(parameter);
        var result = command.ExecuteScalar();
        return result is bool exists && exists;
    }
    finally
    {
        if (shouldClose)
        {
            connection.Close();
        }
    }
}
