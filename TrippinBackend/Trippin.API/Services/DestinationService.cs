using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;

namespace Trippin.API.Services;

public class DestinationService(AppDbContext db, PexelsService pexels)
{
    public async Task<PagedResult<DestinationListDto>> SearchAsync(
        string? search,
        string? category,
        string? country,
        decimal? minCost,
        decimal? maxCost,
        string sortBy,
        string sortOrder,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page     = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 48);

        var q = db.Destinations.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            q = q.Where(d =>
                d.Name.Contains(s) ||
                d.City.Contains(s) ||
                d.Country.Contains(s) ||
                d.Description.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(category))
            q = q.Where(d => d.Category == category);

        if (!string.IsNullOrWhiteSpace(country))
            q = q.Where(d => d.Country.Contains(country));

        if (minCost.HasValue)
            q = q.Where(d => d.AverageCostPerDay >= minCost.Value);

        if (maxCost.HasValue)
            q = q.Where(d => d.AverageCostPerDay <= maxCost.Value);

        // Sort before paging
        q = (sortBy.ToLowerInvariant(), sortOrder.ToLowerInvariant()) switch
        {
            ("cost",  "desc")       => q.OrderByDescending(d => d.AverageCostPerDay),
            ("cost",  _)            => q.OrderBy(d => d.AverageCostPerDay),
            ("name",  "desc")       => q.OrderByDescending(d => d.Name),
            _                       => q.OrderBy(d => d.Name)
        };

        var total = await q.CountAsync(ct);

        // Fetch just the destination rows — NO join to Reviews
        var destinations = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                d.Id, d.Name, d.Country, d.City,
                d.Category, d.ThumbnailUrl,
                d.AverageCostPerDay, d.Currency, d.IsPopular
            })
            .ToListAsync(ct);

        // Get destination IDs to fetch ratings separately
        var ids = destinations.Select(d => d.Id).ToList();

        // Fetch ratings in a separate query — completely safe, no LEFT JOIN nullable issue
        var ratings = await db.Reviews
            .AsNoTracking()
            .Where(r => ids.Contains(r.DestinationId))
            .GroupBy(r => r.DestinationId)
            .Select(g => new
            {
                DestinationId = g.Key,
                Avg = g.Average(r => (double)r.Rating),
                Cnt = g.Count()
            })
            .ToListAsync(ct);

        // Build a lookup dictionary
        var ratingLookup = ratings.ToDictionary(r => r.DestinationId);

        // Map to DTO in memory — no nullable EF Core mapping issues
        var items = destinations.Select(d =>
        {
            ratingLookup.TryGetValue(d.Id, out var r);
            return new DestinationListDto
            {
                Id                = d.Id,
                Name              = d.Name,
                Country           = d.Country,
                City              = d.City,
                Category          = d.Category,
                ThumbnailUrl      = d.ThumbnailUrl,
                AverageCostPerDay = d.AverageCostPerDay,
                Currency          = d.Currency,
                IsPopular         = d.IsPopular,
                AverageRating     = r?.Avg,
                ReviewCount       = r?.Cnt ?? 0
            };
        }).ToList();

        return new PagedResult<DestinationListDto>
        {
            Items      = items,
            Page       = page,
            PageSize   = pageSize,
            TotalCount = total
        };
    }

    public async Task<IReadOnlyList<DestinationListDto>> GetPopularAsync(
        int count,
        CancellationToken ct = default)
    {
        count = Math.Clamp(count, 1, 24);

        // Fetch popular destinations — NO join
        var destinations = await db.Destinations
            .AsNoTracking()
            .Where(d => d.IsPopular)
            .OrderBy(d => d.Name)
            .Take(count)
            .Select(d => new
            {
                d.Id, d.Name, d.Country, d.City,
                d.Category, d.ThumbnailUrl,
                d.AverageCostPerDay, d.Currency, d.IsPopular
            })
            .ToListAsync(ct);

        var ids = destinations.Select(d => d.Id).ToList();

        // Separate ratings query
        var ratings = await db.Reviews
            .AsNoTracking()
            .Where(r => ids.Contains(r.DestinationId))
            .GroupBy(r => r.DestinationId)
            .Select(g => new
            {
                DestinationId = g.Key,
                Avg = g.Average(r => (double)r.Rating),
                Cnt = g.Count()
            })
            .ToListAsync(ct);

        var ratingLookup = ratings.ToDictionary(r => r.DestinationId);

        return destinations.Select(d =>
        {
            ratingLookup.TryGetValue(d.Id, out var r);
            return new DestinationListDto
            {
                Id                = d.Id,
                Name              = d.Name,
                Country           = d.Country,
                City              = d.City,
                Category          = d.Category,
                ThumbnailUrl      = d.ThumbnailUrl,
                AverageCostPerDay = d.AverageCostPerDay,
                Currency          = d.Currency,
                IsPopular         = d.IsPopular,
                AverageRating     = r?.Avg,
                ReviewCount       = r?.Cnt ?? 0
            };
        }).ToList();
    }

    public async Task<DestinationDetailDto?> GetByIdAsync(
        int id,
        CancellationToken ct = default)
    {
        var d = await db.Destinations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (d is null) return null;

        // Auto-fetch missing images from Pexels if needed
        if (string.IsNullOrWhiteSpace(d.ImageUrl) || string.IsNullOrWhiteSpace(d.ThumbnailUrl) || d.ImageUrl.Contains("images.unsplash.com/photo-") && d.ImageUrl.Length < 40)
        {
            var (hero, thumb) = await pexels.GetDestinationImagesAsync($"{d.Name} {d.Country}", ct);
            if (!string.IsNullOrEmpty(hero))
            {
                var destToUpdate = await db.Destinations.FindAsync(new object[] { d.Id }, ct);
                if (destToUpdate != null)
                {
                    destToUpdate.ImageUrl = hero;
                    destToUpdate.ThumbnailUrl = thumb;
                    await db.SaveChangesAsync(ct);
                    
                    // Update the local variable for DTO mapping
                    d.ImageUrl = hero;
                    d.ThumbnailUrl = thumb;
                }
            }
        }

        var avg = await db.Reviews
            .AsNoTracking()
            .Where(r => r.DestinationId == id)
            .AverageAsync(r => (double?)r.Rating, ct);

        var cnt = await db.Reviews
            .AsNoTracking()
            .CountAsync(r => r.DestinationId == id, ct);

        var highlights = string.IsNullOrEmpty(d.Highlights)
            ? Array.Empty<string>()
            : d.Highlights.Split('|',
                StringSplitOptions.RemoveEmptyEntries |
                StringSplitOptions.TrimEntries);

        var related = await db.Destinations
            .AsNoTracking()
            .Where(x => x.Category == d.Category && x.Id != d.Id)
            .OrderBy(x => x.Name)
            .Take(4)
            .Select(x => new DestinationListDto
            {
                Id                = x.Id,
                Name              = x.Name,
                Country           = x.Country,
                City              = x.City,
                Category          = x.Category,
                ThumbnailUrl      = x.ThumbnailUrl,
                AverageCostPerDay = x.AverageCostPerDay,
                Currency          = x.Currency,
                IsPopular         = x.IsPopular,
                AverageRating     = null,
                ReviewCount       = 0
            })
            .ToListAsync(ct);

        return new DestinationDetailDto
        {
            Id                = d.Id,
            Name              = d.Name,
            Country           = d.Country,
            City              = d.City,
            Category          = d.Category,
            ThumbnailUrl      = d.ThumbnailUrl,
            AverageCostPerDay = d.AverageCostPerDay,
            Currency          = d.Currency,
            IsPopular         = d.IsPopular,
            AverageRating     = avg,
            ReviewCount       = cnt,
            Description       = d.Description,
            ImageUrl          = d.ImageUrl,
            Latitude          = d.Latitude,
            Longitude         = d.Longitude,
            Tags              = d.Tags,
            Highlights        = highlights,
            BestTimeToVisit   = d.BestTimeToVisit,
            RelatedDestinations = related
        };
    }

    public async Task<IReadOnlyList<DestinationListDto>> GetRecommendationsAsync(
        int userId,
        int take,
        CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 24);

        var visitedCategories = await db.TripDestinations
            .AsNoTracking()
            .Where(td => td.Trip.UserId == userId)
            .Select(td => td.Destination.Category)
            .Distinct()
            .ToListAsync(ct);

        var visitedIds = await db.TripDestinations
            .AsNoTracking()
            .Where(td => td.Trip.UserId == userId)
            .Select(td => td.DestinationId)
            .Distinct()
            .ToListAsync(ct);

        var q = db.Destinations
            .AsNoTracking()
            .Where(d => !visitedIds.Contains(d.Id));

        if (visitedCategories.Count > 0)
            q = q.Where(d => visitedCategories.Contains(d.Category));

        var list = await q
            .OrderByDescending(d => d.IsPopular)
            .ThenBy(d => d.Name)
            .Take(take)
            .Select(d => new DestinationListDto
            {
                Id                = d.Id,
                Name              = d.Name,
                Country           = d.Country,
                City              = d.City,
                Category          = d.Category,
                ThumbnailUrl      = d.ThumbnailUrl,
                AverageCostPerDay = d.AverageCostPerDay,
                Currency          = d.Currency,
                IsPopular         = d.IsPopular,
                AverageRating     = null,
                ReviewCount       = 0
            })
            .ToListAsync(ct);

        if (list.Count >= take) return list;

        var need    = take - list.Count;
        var exclude = list.Select(x => x.Id).Concat(visitedIds).ToHashSet();

        var fallback = await db.Destinations
            .AsNoTracking()
            .Where(d => !exclude.Contains(d.Id))
            .OrderByDescending(d => d.IsPopular)
            .Take(need)
            .Select(d => new DestinationListDto
            {
                Id                = d.Id,
                Name              = d.Name,
                Country           = d.Country,
                City              = d.City,
                Category          = d.Category,
                ThumbnailUrl      = d.ThumbnailUrl,
                AverageCostPerDay = d.AverageCostPerDay,
                Currency          = d.Currency,
                IsPopular         = d.IsPopular,
                AverageRating     = null,
                ReviewCount       = 0
            })
            .ToListAsync(ct);

        return list.Concat(fallback).Take(take).ToList();
    }
}