using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Models;

namespace Trippin.API.Services;

public class ReviewService(AppDbContext db)
{
    static IReadOnlyList<string> SplitPhotos(string? photos) =>
        string.IsNullOrEmpty(photos)
            ? Array.Empty<string>()
            : photos.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public async Task<PagedResult<ReviewDto>> GetForDestinationAsync(int destinationId, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 48);
        var q = db.Reviews.AsNoTracking()
            .Where(r => r.DestinationId == destinationId)
            .OrderByDescending(r => r.CreatedAt);

        var total = await q.CountAsync(ct);
        var rows = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Title,
                r.Content,
                r.Photos,
                r.IsVerified,
                r.HelpfulVotes,
                AuthorName = r.User.Name,
                AuthorAvatarUrl = r.User.AvatarUrl,
                r.DestinationId,
                r.CreatedAt
            })
            .ToListAsync(ct);

        var items = rows.Select(r => new ReviewDto
        {
            Id = r.Id,
            Rating = r.Rating,
            Title = r.Title,
            Content = r.Content,
            Photos = SplitPhotos(r.Photos),
            IsVerified = r.IsVerified,
            HelpfulVotes = r.HelpfulVotes,
            AuthorName = r.AuthorName,
            AuthorAvatarUrl = r.AuthorAvatarUrl,
            DestinationId = r.DestinationId,
            CreatedAt = r.CreatedAt
        }).ToList();

        return new PagedResult<ReviewDto> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    public async Task<IReadOnlyList<MyReviewDto>> GetMyReviewsAsync(int userId, CancellationToken ct = default)
    {
        var rows = await db.Reviews.AsNoTracking()
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Title,
                r.Content,
                r.Photos,
                r.IsVerified,
                r.HelpfulVotes,
                AuthorName = r.User.Name,
                AuthorAvatarUrl = r.User.AvatarUrl,
                r.DestinationId,
                r.CreatedAt,
                DestinationName = r.Destination.Name
            })
            .ToListAsync(ct);

        return rows.Select(r => new MyReviewDto
        {
            Id = r.Id,
            Rating = r.Rating,
            Title = r.Title,
            Content = r.Content,
            Photos = SplitPhotos(r.Photos),
            IsVerified = r.IsVerified,
            HelpfulVotes = r.HelpfulVotes,
            AuthorName = r.AuthorName,
            AuthorAvatarUrl = r.AuthorAvatarUrl,
            DestinationId = r.DestinationId,
            CreatedAt = r.CreatedAt,
            DestinationName = r.DestinationName
        }).ToList();
    }

    public async Task<ReviewDto?> CreateAsync(int userId, CreateReviewRequest req, CancellationToken ct = default)
    {
        var destExists = await db.Destinations.AsNoTracking().AnyAsync(d => d.Id == req.DestinationId, ct);
        if (!destExists) return null;

        var dup = await db.Reviews.AnyAsync(r => r.UserId == userId && r.DestinationId == req.DestinationId, ct);
        if (dup) return null;

        var photos = req.Photos is { Length: > 0 } ? string.Join(',', req.Photos) : null;
        var review = new Review
        {
            Rating = req.Rating,
            Title = req.Title,
            Content = req.Content,
            Photos = photos,
            UserId = userId,
            DestinationId = req.DestinationId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Reviews.Add(review);
        await db.SaveChangesAsync(ct);

        var row = await db.Reviews.AsNoTracking()
            .Where(r => r.Id == review.Id)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Title,
                r.Content,
                r.Photos,
                r.IsVerified,
                r.HelpfulVotes,
                AuthorName = r.User.Name,
                AuthorAvatarUrl = r.User.AvatarUrl,
                r.DestinationId,
                r.CreatedAt
            })
            .FirstOrDefaultAsync(ct);

        if (row is null) return null;

        return new ReviewDto
        {
            Id = row.Id,
            Rating = row.Rating,
            Title = row.Title,
            Content = row.Content,
            Photos = SplitPhotos(row.Photos),
            IsVerified = row.IsVerified,
            HelpfulVotes = row.HelpfulVotes,
            AuthorName = row.AuthorName,
            AuthorAvatarUrl = row.AuthorAvatarUrl,
            DestinationId = row.DestinationId,
            CreatedAt = row.CreatedAt
        };
    }

    public async Task<bool> SoftDeleteAsync(int reviewId, int userId, CancellationToken ct = default)
    {
        var r = await db.Reviews.FirstOrDefaultAsync(x => x.Id == reviewId && x.UserId == userId, ct);
        if (r is null) return false;
        r.IsDeleted = true;
        r.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
