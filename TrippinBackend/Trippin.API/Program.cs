using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.OpenApi;
using Trippin.API;
using Trippin.API.Data;
using Trippin.API.Helpers;
using Trippin.API.Middleware;
using Trippin.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("AzureConnection"),
        sql => sql.EnableRetryOnFailure(3));
});

builder.Services.AddSingleton<JwtHelper>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<DestinationService>();
builder.Services.AddScoped<TripService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<ItineraryService>();
builder.Services.AddScoped<OAuthService>();
builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<RapidTravelService>();
builder.Services.AddSingleton<GeminiService>();
builder.Services.AddSingleton<PexelsService>();
builder.Services.AddScoped<GlobalDiscoveryService>();

// Phase 3: SaaS Infrastructure
builder.Services.AddMemoryCache();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("PublicApi", opt =>
    {
        opt.PermitLimit = 30; // 30 requests
        opt.Window = TimeSpan.FromMinutes(1); // per minute
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

var jwtHelper = new JwtHelper(builder.Configuration);
var jwtParams = jwtHelper.GetValidationParameters();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { options.TokenValidationParameters = jwtParams; });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Manager", policy => policy.RequireRole("Manager"));
    options.AddPolicy("AdminOrManager", policy => policy.RequireRole("Admin", "Manager"));
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Trippin API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT: paste token only, or prefix with Bearer "
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document, null)] = new List<string>()
    });
});

builder.Services.AddCors(o => o.AddPolicy("Frontend", p => p
    .SetIsOriginAllowed(origin => 
    {
        var host = new Uri(origin).Host;
        return host == "localhost" || host.EndsWith(".vercel.app");
    })
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    var raw = app.Configuration.GetConnectionString("AzureConnection");
    (string? server, string? database) = ConnectionStringParser.ParseSqlServer(raw);
    if (server is not null && database is not null)
    {
        app.Logger.LogInformation(
            "Database for SSMS: Server={Server}; Database={Database}; use Windows Authentication when matching Integrated Security.",
            server,
            database);
    }
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseRateLimiter();
app.UseCors("Frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapTrippinEndpoints();

app.Run();
