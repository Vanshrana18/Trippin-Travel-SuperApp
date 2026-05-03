using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Models;

namespace Trippin.API.Services;

public class BookingService(AppDbContext db)
{
    public Task<bool> TripOwnedAsync(int tripId, int userId, CancellationToken ct = default) =>
        db.Trips.AsNoTracking().AnyAsync(t => t.Id == tripId && t.UserId == userId, ct);

    public async Task<PagedResult<BookingDto>> GetMyBookingsAsync(int userId, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 48);
        var q = db.Bookings.AsNoTracking().Where(b => b.UserId == userId).OrderByDescending(b => b.BookingDate);
        var total = await q.CountAsync(ct);
        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                Type = b.Type,
                Title = b.Title,
                Provider = b.Provider,
                ConfirmationNumber = b.ConfirmationNumber,
                TotalPrice = b.TotalPrice,
                Currency = b.Currency,
                BookingDate = b.BookingDate,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                Status = b.Status,
                Notes = b.Notes,
                DocumentUrl = b.DocumentUrl,
                TripId = b.TripId,
                TripTitle = b.Trip.Title,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<BookingDto> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    public async Task<BookingDto?> GetByIdAsync(int bookingId, int userId, CancellationToken ct = default)
    {
        return await db.Bookings.AsNoTracking()
            .Where(b => b.Id == bookingId && b.UserId == userId)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                Type = b.Type,
                Title = b.Title,
                Provider = b.Provider,
                ConfirmationNumber = b.ConfirmationNumber,
                TotalPrice = b.TotalPrice,
                Currency = b.Currency,
                BookingDate = b.BookingDate,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                Status = b.Status,
                Notes = b.Notes,
                DocumentUrl = b.DocumentUrl,
                TripId = b.TripId,
                TripTitle = b.Trip.Title,
                CreatedAt = b.CreatedAt
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<BookingDto>> GetByTripAsync(int tripId, int userId, CancellationToken ct = default)
    {
        return await db.Bookings.AsNoTracking()
            .Where(b => b.TripId == tripId && b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                Type = b.Type,
                Title = b.Title,
                Provider = b.Provider,
                ConfirmationNumber = b.ConfirmationNumber,
                TotalPrice = b.TotalPrice,
                Currency = b.Currency,
                BookingDate = b.BookingDate,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                Status = b.Status,
                Notes = b.Notes,
                DocumentUrl = b.DocumentUrl,
                TripId = b.TripId,
                TripTitle = b.Trip.Title,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<BookingDto?> CreateAsync(int userId, CreateBookingRequest req, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var trip = await db.Trips.FirstOrDefaultAsync(t => t.Id == req.TripId && t.UserId == userId, ct);
            if (trip is null)
            {
                await tx.RollbackAsync(ct);
                return null;
            }

            var booking = new Booking
            {
                Type = req.Type,
                Title = req.Title,
                Provider = req.Provider,
                ConfirmationNumber = req.ConfirmationNumber,
                TotalPrice = req.TotalPrice,
                Currency = req.Currency,
                BookingDate = req.BookingDate,
                CheckInDate = req.CheckInDate,
                CheckOutDate = req.CheckOutDate,
                Status = "Pending",
                Notes = req.Notes,
                DocumentUrl = req.DocumentUrl,
                UserId = userId,
                TripId = req.TripId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Bookings.Add(booking);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return await GetByIdAsync(booking.Id, userId, ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<BookingDto?> UpdateStatusAsync(int bookingId, int userId, string status, CancellationToken ct = default)
    {
        var b = await db.Bookings.FirstOrDefaultAsync(x => x.Id == bookingId && x.UserId == userId, ct);
        if (b is null) return null;
        b.Status = status;
        b.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return await GetByIdAsync(bookingId, userId, ct);
    }

    public async Task<bool> CancelAsync(int bookingId, int userId, CancellationToken ct = default)
    {
        var b = await db.Bookings.FirstOrDefaultAsync(x => x.Id == bookingId && x.UserId == userId, ct);
        if (b is null) return false;
        b.Status = "Cancelled";
        b.IsDeleted = true;
        b.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
