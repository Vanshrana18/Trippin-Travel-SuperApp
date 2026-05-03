using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Models;

namespace Trippin.API.Services;

public class UserService(AppDbContext db)
{
    public async Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken ct = default)
    {
        return await db.Users.AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserProfileDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                AvatarUrl = u.AvatarUrl,
                Bio = u.Bio,
                Country = u.Country,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest req, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return null;

        if (req.Name is not null) user.Name = req.Name;
        if (req.Bio is not null) user.Bio = req.Bio;
        if (req.Country is not null) user.Country = req.Country;
        if (req.AvatarUrl is not null) user.AvatarUrl = req.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return await GetProfileAsync(userId, ct);
    }

    public async Task<bool> SoftDeleteAsync(int userId, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return false;
        user.IsDeleted = true;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<DashboardStatsDto?> GetDashboardAsync(int userId, CancellationToken ct = default)
    {
        var exists = await db.Users.AsNoTracking().AnyAsync(u => u.Id == userId, ct);
        if (!exists) return null;

        var tripCount = await db.Trips.AsNoTracking().CountAsync(t => t.UserId == userId, ct);
        var activeTrips = await db.Trips.AsNoTracking().CountAsync(t => t.UserId == userId && t.Status == "Active", ct);
        var bookingCount = await db.Bookings.AsNoTracking().CountAsync(b => b.UserId == userId, ct);
        var totalSpend = await db.Bookings.AsNoTracking()
            .Where(b => b.UserId == userId && b.Status != "Cancelled")
            .SumAsync(b => (decimal?)b.TotalPrice, ct) ?? 0;

        var destVisited = await db.TripDestinations.AsNoTracking()
            .Where(td => td.Trip.UserId == userId && (td.Trip.Status == "Completed" || td.Trip.Status == "Active"))
            .Select(td => td.DestinationId)
            .Distinct()
            .CountAsync(ct);

        var reviewCount = await db.Reviews.AsNoTracking().CountAsync(r => r.UserId == userId, ct);

        return new DashboardStatsDto
        {
            TripCount = tripCount,
            ActiveTrips = activeTrips,
            BookingCount = bookingCount,
            TotalSpend = totalSpend,
            DestinationsVisited = destVisited,
            ReviewCount = reviewCount
        };
    }
}
