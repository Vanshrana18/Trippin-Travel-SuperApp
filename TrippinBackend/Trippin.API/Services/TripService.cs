using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Models;

namespace Trippin.API.Services;

public class TripService(AppDbContext db)
{
    public async Task<PagedResult<TripListDto>> GetMyTripsAsync(
        int userId,
        string? status,
        string sortBy,
        string sortOrder,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 48);
        var q = db.Trips.AsNoTracking().Where(t => t.UserId == userId && !t.IsDeleted);

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(t => t.Status == status);

        q = (sortBy.ToLowerInvariant(), sortOrder.ToLowerInvariant()) switch
        {
            ("startdate", "desc") => q.OrderByDescending(t => t.StartDate),
            ("startdate", _) => q.OrderBy(t => t.StartDate),
            ("title", "desc") => q.OrderByDescending(t => t.Title),
            ("title", _) => q.OrderBy(t => t.Title),
            ("budget", "desc") => q.OrderByDescending(t => t.Budget),
            ("budget", _) => q.OrderBy(t => t.Budget),
            _ => q.OrderByDescending(t => t.UpdatedAt)
        };

        var total = await q.CountAsync(ct);
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TripListDto
            {
                Id = t.Id,
                Title = t.Title,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                Status = t.Status,
                Budget = t.Budget,
                Currency = t.Currency,
                CoverImageUrl = t.CoverImageUrl,
                TravelersCount = t.TravelersCount,
                IsPublic = t.IsPublic,
                DestinationCount = t.TripDestinations.Count,
                BookingCount = t.Bookings.Count
            })
            .ToListAsync(ct);

        return new PagedResult<TripListDto> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    public async Task<PagedResult<TripListDto>> GetPublicTripsAsync(
        string sortBy,
        string sortOrder,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 48);
        var q = db.Trips.AsNoTracking().Where(t => t.IsPublic && !t.IsDeleted);

        q = (sortBy.ToLowerInvariant(), sortOrder.ToLowerInvariant()) switch
        {
            ("startdate", "desc") => q.OrderByDescending(t => t.StartDate),
            ("startdate", _) => q.OrderBy(t => t.StartDate),
            _ => q.OrderByDescending(t => t.CreatedAt)
        };

        var total = await q.CountAsync(ct);
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TripListDto
            {
                Id = t.Id,
                Title = t.Title,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                Status = t.Status,
                Budget = t.Budget,
                Currency = t.Currency,
                CoverImageUrl = t.CoverImageUrl,
                TravelersCount = t.TravelersCount,
                IsPublic = t.IsPublic,
                DestinationCount = t.TripDestinations.Count,
                BookingCount = t.Bookings.Count
            })
            .ToListAsync(ct);

        return new PagedResult<TripListDto> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    public async Task<TripDetailDto?> GetByIdAsync(int tripId, int userId, bool allowPublicRead, CancellationToken ct = default)
    {
        var t = await db.Trips.AsNoTracking()
            .Include(x => x.TripDestinations).ThenInclude(td => td.Destination)
            .FirstOrDefaultAsync(x => x.Id == tripId && !x.IsDeleted, ct);

        if (t is null) return null;
        if (t.UserId != userId && !(allowPublicRead && t.IsPublic)) return null;

        var dests = t.TripDestinations
            .OrderBy(td => td.VisitOrder)
            .Select(td => new TripDestinationDto
            {
                DestinationId = td.DestinationId,
                Name = td.Destination.Name,
                City = td.Destination.City,
                Country = td.Destination.Country,
                Category = td.Destination.Category,
                ThumbnailUrl = td.Destination.ThumbnailUrl,
                VisitOrder = td.VisitOrder,
                DaysToSpend = td.DaysToSpend,
                Notes = td.Notes
            })
            .ToList();

        var bookingCount = await db.Bookings.AsNoTracking().CountAsync(b => b.TripId == tripId, ct);

        return new TripDetailDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            Status = t.Status,
            Budget = t.Budget,
            Currency = t.Currency,
            CoverImageUrl = t.CoverImageUrl,
            TravelersCount = t.TravelersCount,
            IsPublic = t.IsPublic,
            DestinationCount = dests.Count,
            BookingCount = bookingCount,
            Destinations = dests
        };
    }

    public async Task<TripDetailDto?> CreateAsync(int userId, CreateTripRequest req, CancellationToken ct = default)
    {
        if (req.EndDate < req.StartDate) return null;

        var trip = new Trip
        {
            Title = req.Title,
            Description = req.Description,
            StartDate = req.StartDate,
            EndDate = req.EndDate,
            Budget = req.Budget,
            Currency = req.Currency,
            CoverImageUrl = req.CoverImageUrl,
            TravelersCount = req.TravelersCount,
            IsPublic = req.IsPublic,
            UserId = userId,
            Status = "Planning",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Trips.Add(trip);
        await db.SaveChangesAsync(ct);

        if (req.DestinationIds is { Length: > 0 })
        {
            var order = 0;
            foreach (var did in req.DestinationIds.Distinct())
            {
                var exists = await db.Destinations.AsNoTracking().AnyAsync(d => d.Id == did, ct);
                if (!exists) continue;
                db.TripDestinations.Add(new TripDestination
                {
                    TripId = trip.Id,
                    DestinationId = did,
                    VisitOrder = order++,
                    DaysToSpend = 1,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await db.SaveChangesAsync(ct);
        }

        return await GetByIdAsync(trip.Id, userId, false, ct);
    }

    public async Task<TripDetailDto?> UpdateAsync(int tripId, int userId, UpdateTripRequest req, CancellationToken ct = default)
    {
        var trip = await db.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId, ct);
        if (trip is null) return null;

        if (req.Title is not null) trip.Title = req.Title;
        if (req.Description is not null) trip.Description = req.Description;
        if (req.StartDate.HasValue) trip.StartDate = req.StartDate.Value;
        if (req.EndDate.HasValue) trip.EndDate = req.EndDate.Value;
        if (trip.EndDate < trip.StartDate) return null;
        if (req.Budget.HasValue) trip.Budget = req.Budget.Value;
        if (req.Currency is not null) trip.Currency = req.Currency;
        if (req.CoverImageUrl is not null) trip.CoverImageUrl = req.CoverImageUrl;
        if (req.TravelersCount.HasValue) trip.TravelersCount = req.TravelersCount.Value;
        if (req.IsPublic.HasValue) trip.IsPublic = req.IsPublic.Value;
        if (req.Status is not null) trip.Status = req.Status;
        trip.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return await GetByIdAsync(tripId, userId, false, ct);
    }

    public async Task<bool> SoftDeleteAsync(int tripId, int userId, CancellationToken ct = default)
    {
        var trip = await db.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId, ct);
        if (trip is null) return false;
        trip.IsDeleted = true;
        trip.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> AddDestinationAsync(int tripId, int userId, int destinationId, CancellationToken ct = default)
    {
        var trip = await db.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId, ct);
        if (trip is null) return false;

        var destExists = await db.Destinations.AsNoTracking().AnyAsync(d => d.Id == destinationId, ct);
        if (!destExists) return false;

        var dup = await db.TripDestinations.AnyAsync(td => td.TripId == tripId && td.DestinationId == destinationId, ct);
        if (dup) return false;

        var maxOrder = await db.TripDestinations.Where(td => td.TripId == tripId).MaxAsync(td => (int?)td.VisitOrder, ct) ?? -1;
        db.TripDestinations.Add(new TripDestination
        {
            TripId = tripId,
            DestinationId = destinationId,
            VisitOrder = maxOrder + 1,
            DaysToSpend = 1,
            CreatedAt = DateTime.UtcNow
        });
        trip.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemoveDestinationAsync(int tripId, int userId, int destinationId, CancellationToken ct = default)
    {
        var trip = await db.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId, ct);
        if (trip is null) return false;

        var link = await db.TripDestinations.FirstOrDefaultAsync(td => td.TripId == tripId && td.DestinationId == destinationId, ct);
        if (link is null) return false;

        db.TripDestinations.Remove(link);
        trip.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
