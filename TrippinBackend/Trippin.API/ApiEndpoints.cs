using Trippin.API.DTOs;
using Trippin.API.Extensions;
using Trippin.API.Helpers;
using Trippin.API.Services;
using Microsoft.EntityFrameworkCore;

namespace Trippin.API;

public static class ApiEndpoints
{
    public static void MapTrippinEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api").RequireRateLimiting("PublicApi");

        api.MapGet("/ping", () => Results.Ok(new { status = "healthy", message = "pong" })).AllowAnonymous();

        MapAuth(api);
        MapUsers(api);
        MapDestinations(api);
        MapTrips(api);
        MapBookings(api);
        MapReviews(api);
        MapItineraries(api);
        MapSearch(api);
        MapAdmin(api);
    }

    static void MapAuth(RouteGroupBuilder api)
    {
        api.MapPost("/auth/register", async (RegisterRequest req, AuthService svc, CancellationToken ct) =>
        {
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var result = await svc.RegisterAsync(req, ct);
            return result is null
                ? Results.Conflict(new { error = "Email already registered." })
                : Results.Created("/api/users/me", result);
        }).AllowAnonymous();

        api.MapPost("/auth/login", async (LoginRequest req, AuthService svc, CancellationToken ct) =>
        {
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var result = await svc.LoginAsync(req, ct);
            return result is null ? Results.Unauthorized() : Results.Ok(result);
        }).AllowAnonymous();

        api.MapPost("/auth/google", async (GoogleLoginRequest req, OAuthService svc, CancellationToken ct) =>
        {
            var result = await svc.LoginWithGoogleAsync(req.IdToken, ct);
            return result is null ? Results.Unauthorized() : Results.Ok(result);
        }).AllowAnonymous();

        api.MapPost("/auth/github", async (GitHubLoginRequest req, OAuthService svc, CancellationToken ct) =>
        {
            var result = await svc.LoginWithGitHubAsync(req.Code, ct);
            return result is null ? Results.Unauthorized() : Results.Ok(result);
        }).AllowAnonymous();

        api.MapPost("/auth/microsoft", async (MicrosoftLoginRequest req, OAuthService svc, CancellationToken ct) =>
        {
            var result = await svc.LoginWithMicrosoftAsync(req.IdToken, ct);
            return result is null ? Results.Unauthorized() : Results.Ok(result);
        }).AllowAnonymous();
    }

    static void MapUsers(RouteGroupBuilder api)
    {
        var g = api.MapGroup("/users").RequireAuthorization();

        g.MapGet("/me", async (HttpContext ctx, UserService svc, CancellationToken ct) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var p = await svc.GetProfileAsync(uid.Value, ct);
            return p is null ? Results.NotFound() : Results.Ok(p);
        });

        g.MapPut("/me", async (HttpContext ctx, UpdateProfileRequest req, UserService svc, CancellationToken ct) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var p = await svc.UpdateProfileAsync(uid.Value, req, ct);
            return p is null ? Results.NotFound() : Results.Ok(p);
        });

        g.MapDelete("/me", async (HttpContext ctx, UserService svc, CancellationToken ct) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var ok = await svc.SoftDeleteAsync(uid.Value, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        });

        g.MapGet("/me/dashboard", async (HttpContext ctx, UserService svc, CancellationToken ct) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var d = await svc.GetDashboardAsync(uid.Value, ct);
            return d is null ? Results.NotFound() : Results.Ok(d);
        });
    }

    static void MapDestinations(RouteGroupBuilder api)
    {
        api.MapGet("/destinations", async (
            DestinationService svc,
            string? search,
            string? category,
            string? country,
            decimal? minCost,
            decimal? maxCost,
            string sortBy = "name",
            string sortOrder = "asc",
            int page = 1,
            int pageSize = 12,
            CancellationToken ct = default) =>
        {
            var result = await svc.SearchAsync(search, category, country, minCost, maxCost, sortBy, sortOrder, page, pageSize, ct);
            return Results.Ok(result);
        }).AllowAnonymous();

        api.MapGet("/destinations/popular", async (DestinationService svc, int count = 6, CancellationToken ct = default) =>
        {
            var list = await svc.GetPopularAsync(count, ct);
            return Results.Ok(list);
        }).AllowAnonymous();

        api.MapGet("/destinations/trending", async (DestinationService svc, int count = 12, CancellationToken ct = default) =>
        {
            var list = await svc.GetTrendingAsync(count, ct);
            return Results.Ok(list);
        }).AllowAnonymous();

        api.MapGet("/destinations/recommendations", async (HttpContext ctx, DestinationService svc, int count = 8, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var list = await svc.GetRecommendationsAsync(uid.Value, count, ct);
            return Results.Ok(list);
        }).RequireAuthorization();

        api.MapGet("/destinations/{id:int}", async (int id, DestinationService svc, CancellationToken ct = default) =>
        {
            var d = await svc.GetByIdAsync(id, ct);
            return d is null ? Results.NotFound() : Results.Ok(d);
        }).AllowAnonymous();

        api.MapGet("/destinations/heal-images", async (Trippin.API.Data.AppDbContext db, PexelsService pexels, CancellationToken ct = default) =>
        {
            var brokenDests = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                System.Linq.Queryable.Where(db.Destinations, d => d.ImageUrl != null && d.ImageUrl.Contains("unsplash.com")), ct);

            int healed = 0;
            foreach (var dest in brokenDests)
            {
                var query = $"{dest.Name} {dest.Country} travel landmark";
                var (hero, thumb) = await pexels.GetDestinationImagesAsync(query, ct);
                if (!string.IsNullOrEmpty(hero))
                {
                    dest.ImageUrl = hero;
                    dest.ThumbnailUrl = thumb;
                    healed++;
                }
            }

            await db.SaveChangesAsync(ct);
            return Results.Ok(new { message = $"Healed {healed} broken images out of {brokenDests.Count} destinations." });
        }).RequireAuthorization("AdminOrManager");
    }

    static void MapTrips(RouteGroupBuilder api)
    {
        var g = api.MapGroup("/trips").RequireAuthorization();

        g.MapGet("", async (
            HttpContext ctx,
            TripService svc,
            string? status,
            string sortBy = "updated",
            string sortOrder = "desc",
            int page = 1,
            int pageSize = 12,
            CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var r = await svc.GetMyTripsAsync(uid.Value, status, sortBy, sortOrder, page, pageSize, ct);
            return Results.Ok(r);
        });

        g.MapGet("/public", async (
            TripService svc,
            string sortBy = "created",
            string sortOrder = "desc",
            int page = 1,
            int pageSize = 12,
            CancellationToken ct = default) =>
        {
            var r = await svc.GetPublicTripsAsync(sortBy, sortOrder, page, pageSize, ct);
            return Results.Ok(r);
        });

        g.MapGet("/{id:int}", async (HttpContext ctx, int id, TripService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var t = await svc.GetByIdAsync(id, uid.Value, allowPublicRead: true, ct);
            return t is null ? Results.NotFound() : Results.Ok(t);
        });

        g.MapPost("/", async (HttpContext ctx, CreateTripRequest req, TripService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var t = await svc.CreateAsync(uid.Value, req, ct);
            return t is null
                ? Results.BadRequest(new { error = "Invalid trip dates." })
                : Results.Created($"/api/trips/{t.Id}", t);
        });

        g.MapPut("/{id:int}", async (HttpContext ctx, int id, UpdateTripRequest req, TripService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var t = await svc.UpdateAsync(id, uid.Value, req, ct);
            return t is null ? Results.NotFound() : Results.Ok(t);
        });

        g.MapDelete("/{id:int}", async (HttpContext ctx, int id, TripService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var ok = await svc.SoftDeleteAsync(id, uid.Value, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        });

        g.MapPost("/{id:int}/destinations/{destId:int}", async (HttpContext ctx, int id, int destId, TripService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var ok = await svc.AddDestinationAsync(id, uid.Value, destId, ct);
            return ok ? Results.Ok(new { added = true }) : Results.BadRequest(new { error = "Could not add destination." });
        });

        g.MapDelete("/{id:int}/destinations/{destId:int}", async (HttpContext ctx, int id, int destId, TripService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var ok = await svc.RemoveDestinationAsync(id, uid.Value, destId, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        });
    }

    static void MapBookings(RouteGroupBuilder api)
    {
        var g = api.MapGroup("/bookings").RequireAuthorization();

        g.MapGet("", async (HttpContext ctx, BookingService svc, int page = 1, int pageSize = 12, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var r = await svc.GetMyBookingsAsync(uid.Value, page, pageSize, ct);
            return Results.Ok(r);
        });

        g.MapGet("/trip/{tripId:int}", async (HttpContext ctx, int tripId, BookingService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!await svc.TripOwnedAsync(tripId, uid.Value, ct))
                return Results.NotFound();
            var list = await svc.GetByTripAsync(tripId, uid.Value, ct);
            return Results.Ok(list);
        });

        g.MapGet("/{id:int}", async (HttpContext ctx, int id, BookingService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var b = await svc.GetByIdAsync(id, uid.Value, ct);
            return b is null ? Results.NotFound() : Results.Ok(b);
        });

        g.MapPost("/", async (HttpContext ctx, CreateBookingRequest req, BookingService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var b = await svc.CreateAsync(uid.Value, req, ct);
            return b is null
                ? Results.NotFound()
                : Results.Created($"/api/bookings/{b.Id}", b);
        });

        g.MapPatch("/{id:int}/status", async (HttpContext ctx, int id, UpdateBookingStatusRequest req, BookingService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var b = await svc.UpdateStatusAsync(id, uid.Value, req.Status, ct);
            return b is null ? Results.NotFound() : Results.Ok(b);
        });

        g.MapDelete("/{id:int}", async (HttpContext ctx, int id, BookingService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var ok = await svc.CancelAsync(id, uid.Value, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        });
    }

    static void MapReviews(RouteGroupBuilder api)
    {
        api.MapGet("/reviews/destination/{destinationId:int}", async (
            int destinationId,
            ReviewService svc,
            int page = 1,
            int pageSize = 12,
            CancellationToken ct = default) =>
        {
            var r = await svc.GetForDestinationAsync(destinationId, page, pageSize, ct);
            return Results.Ok(r);
        }).AllowAnonymous();

        api.MapGet("/reviews/my", async (HttpContext ctx, ReviewService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var list = await svc.GetMyReviewsAsync(uid.Value, ct);
            return Results.Ok(list);
        }).RequireAuthorization();

        api.MapPost("/reviews", async (HttpContext ctx, CreateReviewRequest req, ReviewService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var r = await svc.CreateAsync(uid.Value, req, ct);
            if (r is null)
                return Results.BadRequest(new { error = "Duplicate review or invalid destination." });
            return Results.Created($"/api/reviews/{r.Id}", r);
        }).RequireAuthorization();

        api.MapDelete("/reviews/{id:int}", async (HttpContext ctx, int id, ReviewService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var ok = await svc.SoftDeleteAsync(id, uid.Value, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        }).RequireAuthorization();
    }

    static void MapItineraries(RouteGroupBuilder api)
    {
        var g = api.MapGroup("/itineraries").RequireAuthorization();

        g.MapGet("/trip/{tripId:int}", async (HttpContext ctx, int tripId, ItineraryService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var list = await svc.GetByTripAsync(tripId, uid.Value, ct);
            return Results.Ok(list);
        });

        g.MapGet("/{id:int}", async (HttpContext ctx, int id, ItineraryService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var i = await svc.GetByIdAsync(id, uid.Value, ct);
            return i is null ? Results.NotFound() : Results.Ok(i);
        });

        g.MapPost("/generate", async (HttpContext ctx, GenerateItineraryRequest req, ItineraryService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            if (!ValidationHelper.TryValidate(req, out var err))
                return Results.ValidationProblem(err);
            var i = await svc.GenerateWithAiAsync(uid.Value, req, ct);
            return i is null
                ? Results.BadRequest(new { error = "Trip or destinations invalid." })
                : Results.Created($"/api/itineraries/{i.Id}", i);
        });

        g.MapDelete("/{id:int}", async (HttpContext ctx, int id, ItineraryService svc, CancellationToken ct = default) =>
        {
            var uid = ctx.User.GetUserId();
            if (uid is null) return Results.Unauthorized();
            var ok = await svc.DeleteAsync(id, uid.Value, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        });
    }

    static void MapSearch(RouteGroupBuilder api)
    {
        var g = api.MapGroup("/search").AllowAnonymous();

        g.MapGet("/flights", async (
            RapidTravelService svc,
            string origin,
            string destination,
            string date,
            string currency = "USD",
            int adults = 1) =>
        {
            if (string.IsNullOrEmpty(origin) || string.IsNullOrEmpty(destination) || string.IsNullOrEmpty(date))
                return Results.BadRequest(new { error = "Origin, destination, and date are required." });
            
            var d = DateTime.Parse(date);
            var results = await svc.SearchFlightsAsync(origin, destination, d, currency, adults);
            return Results.Ok(results);
        });

        g.MapGet("/taxis", async (
            RapidTravelService svc,
            string fromLocation,
            string toLocation,
            string pickupTime,
            string currency = "USD") =>
        {
            if (string.IsNullOrEmpty(fromLocation) || string.IsNullOrEmpty(toLocation) || string.IsNullOrEmpty(pickupTime))
                return Results.BadRequest(new { error = "From, to, and pickup time are required." });
            
            var d = DateTime.Parse(pickupTime);
            var results = await svc.SearchTaxisAsync(fromLocation, toLocation, d, currency);
            return Results.Ok(results);
        });

        g.MapGet("/hotels", async (
            RapidTravelService svc,
            string cityCode,
            string checkIn,
            string checkOut,
            string currency = "USD",
            int adults = 1) =>
        {
            if (string.IsNullOrEmpty(cityCode) || string.IsNullOrEmpty(checkIn) || string.IsNullOrEmpty(checkOut))
                return Results.BadRequest(new { error = "CityCode, checkIn, and checkOut are required." });
            
            var d1 = DateTime.Parse(checkIn);
            var d2 = DateTime.Parse(checkOut);
            var results = await svc.SearchHotelsAsync(cityCode, d1, d2, currency, adults);
            return Results.Ok(results);
        });

        g.MapGet("/trains", async (
            RapidTravelService svc,
            string source,
            string destination,
            string date) =>
        {
            if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(destination) || string.IsNullOrEmpty(date))
                return Results.BadRequest(new { error = "Source, destination, and date are required." });
            
            var d = DateTime.Parse(date);
            var results = await svc.SearchTrainsAsync(source, destination, d);
            return Results.Ok(results);
        });
    }

    static void MapAdmin(RouteGroupBuilder api)
    {
        var g = api.MapGroup("/admin").RequireAuthorization("Admin");

        // List all users (Admin only)
        g.MapGet("/users", async (Trippin.API.Data.AppDbContext db, int page = 1, int pageSize = 20, CancellationToken ct = default) =>
        {
            var query = db.Users.AsNoTracking().Where(u => !u.IsDeleted).OrderByDescending(u => u.CreatedAt);
            var total = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(query, ct);
            var users = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                query.Skip((page - 1) * pageSize).Take(pageSize)
                    .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.AuthProvider, u.CreatedAt }), ct);
            return Results.Ok(new { total, page, pageSize, users });
        });

        // Change user role (Admin only)
        g.MapPatch("/users/{id:int}/role", async (HttpContext ctx, int id, ChangeRoleRequest req, Trippin.API.Data.AppDbContext db, CancellationToken ct) =>
        {
            var validRoles = new[] { "User", "Manager", "Admin" };
            if (!validRoles.Contains(req.Role))
                return Results.BadRequest(new { error = $"Invalid role. Must be one of: {string.Join(", ", validRoles)}" });

            var adminId = ctx.User.GetUserId();
            if (adminId == id)
                return Results.BadRequest(new { error = "Cannot change your own role." });

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, ct);
            if (user is null) return Results.NotFound();

            user.Role = req.Role;
            user.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { user.Id, user.Name, user.Email, user.Role });
        });

        // Delete any user (Admin only)
        g.MapDelete("/users/{id:int}", async (HttpContext ctx, int id, Trippin.API.Data.AppDbContext db, CancellationToken ct) =>
        {
            var adminId = ctx.User.GetUserId();
            if (adminId == id)
                return Results.BadRequest(new { error = "Cannot delete yourself." });

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, ct);
            if (user is null) return Results.NotFound();

            user.IsDeleted = true;
            user.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        // View all bookings across all users (Admin + Manager)
        api.MapGet("/admin/bookings", async (Trippin.API.Data.AppDbContext db, int page = 1, int pageSize = 20, CancellationToken ct = default) =>
        {
            var query = db.Bookings.AsNoTracking().Where(b => !b.IsDeleted).OrderByDescending(b => b.CreatedAt);
            var total = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(query, ct);
            var bookings = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                query.Skip((page - 1) * pageSize).Take(pageSize)
                    .Select(b => new { b.Id, b.UserId, b.TripId, b.Type, b.Provider, b.TotalPrice, b.Currency, b.Status, b.CreatedAt }), ct);
            return Results.Ok(new { total, page, pageSize, bookings });
        }).RequireAuthorization("AdminOrManager");

        // Platform stats (Admin only)
        g.MapGet("/stats", async (Trippin.API.Data.AppDbContext db, CancellationToken ct) =>
        {
            var totalUsers = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(db.Users.Where(u => !u.IsDeleted), ct);
            var totalTrips = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(db.Trips.Where(t => !t.IsDeleted), ct);
            var totalBookings = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(db.Bookings.Where(b => !b.IsDeleted), ct);
            var totalRevenue = await db.Bookings.Where(b => !b.IsDeleted && b.Status != "Cancelled").SumAsync(b => (decimal?)b.TotalPrice, ct) ?? 0;
            var totalDestinations = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(db.Destinations.Where(d => !d.IsDeleted), ct);
            var totalReviews = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(db.Reviews.Where(r => !r.IsDeleted), ct);

            return Results.Ok(new { totalUsers, totalTrips, totalBookings, totalRevenue, totalDestinations, totalReviews });
        });
    }
}
