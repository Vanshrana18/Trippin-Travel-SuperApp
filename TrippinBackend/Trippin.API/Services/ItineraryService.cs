using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Models;

namespace Trippin.API.Services;

public class ItineraryService(AppDbContext db, GeminiService gemini)
{
    public async Task<ItineraryDto?> GetByIdAsync(int itineraryId, int userId, CancellationToken ct = default)
    {
        var i = await db.Itineraries.AsNoTracking()
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == itineraryId && x.UserId == userId, ct);
        if (i is null) return null;

        return Map(i);
    }

    public async Task<IReadOnlyList<ItinerarySummaryDto>> GetByTripAsync(int tripId, int userId, CancellationToken ct = default)
    {
        var owns = await db.Trips.AsNoTracking().AnyAsync(t => t.Id == tripId && t.UserId == userId, ct);
        if (!owns) return Array.Empty<ItinerarySummaryDto>();

        return await db.Itineraries.AsNoTracking()
            .Where(i => i.TripId == tripId && i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new ItinerarySummaryDto
            {
                Id = i.Id,
                Title = i.Title,
                IsAiGenerated = i.IsAiGenerated,
                ItemCount = i.Items.Count,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync(ct);
    }

    /// <summary>
    /// Generate itinerary using real Gemini AI
    /// </summary>
    public async Task<ItineraryDto?> GenerateWithAiAsync(int userId, GenerateItineraryRequest req, CancellationToken ct = default)
    {
        var trip = await db.Trips
            .Include(t => t.TripDestinations)
            .FirstOrDefaultAsync(t => t.Id == req.TripId && t.UserId == userId, ct);
        if (trip is null) return null;

        // Gather destination names for the AI prompt
        var destinationIds = req.DestinationIds.Length > 0
            ? req.DestinationIds
            : trip.TripDestinations.Select(td => td.DestinationId).ToArray();

        var destinations = await db.Destinations.AsNoTracking()
            .Where(d => destinationIds.Contains(d.Id))
            .ToListAsync(ct);

        if (destinations.Count == 0) return null;

        var totalDays = Math.Max(1, (trip.EndDate.Date - trip.StartDate.Date).Days + 1);
        var destinationNames = string.Join(", ", destinations.Select(d => $"{d.City}, {d.Country}"));

        // Call Gemini AI
        string aiJson;
        try
        {
            aiJson = await gemini.GenerateItineraryAsync(
                destinationNames, totalDays, req.TravelStyle, req.Budget, req.Preferences, ct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Gemini AI failed, falling back to rule-based: {ex.Message}");
            return await GenerateAsync(userId, req, ct);
        }

        // Create the itinerary record
        var itinerary = new Itinerary
        {
            Title = $"✨ AI Plan — {trip.Title}",
            Description = $"AI-generated itinerary for {destinationNames}. Style: {req.TravelStyle}, Budget: {req.Budget}.",
            IsAiGenerated = true,
            UserId = userId,
            TripId = trip.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Itineraries.Add(itinerary);
        await db.SaveChangesAsync(ct);

        // Parse AI response into ItineraryItems
        try
        {
            var items = JsonSerializer.Deserialize<JsonElement>(aiJson);
            var sort = 0;

            if (items.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in items.EnumerateArray())
                {
                    var dayNumber = item.TryGetProperty("dayNumber", out var dn) ? dn.GetInt32() : 1;
                    var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "Activity" : "Activity";
                    var description = item.TryGetProperty("description", out var desc) ? desc.GetString() ?? "" : "";
                    var activityType = item.TryGetProperty("activityType", out var at) ? at.GetString() ?? "Sightseeing" : "Sightseeing";
                    var startTime = ParseTime(item.TryGetProperty("startTime", out var st) ? st.GetString() : "09:00");
                    var endTime = ParseTime(item.TryGetProperty("endTime", out var et) ? et.GetString() : "11:00");
                    var location = item.TryGetProperty("location", out var loc) ? loc.GetString() ?? destinationNames : destinationNames;
                    var cost = item.TryGetProperty("estimatedCost", out var ec) ? ec.GetDecimal() : 0m;

                    db.ItineraryItems.Add(new ItineraryItem
                    {
                        ItineraryId = itinerary.Id,
                        DayNumber = dayNumber,
                        Title = title,
                        Description = description,
                        ActivityType = activityType,
                        StartTime = startTime,
                        EndTime = endTime,
                        Location = location,
                        EstimatedCost = cost,
                        Notes = req.Preferences,
                        SortOrder = sort++,
                        DestinationId = destinations.First().Id
                    });
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to parse Gemini response: {ex.Message}");
            // Delete the empty itinerary and fall back
            db.Itineraries.Remove(itinerary);
            await db.SaveChangesAsync(ct);
            return await GenerateAsync(userId, req, ct);
        }

        await db.SaveChangesAsync(ct);

        var full = await db.Itineraries.AsNoTracking()
            .Include(i => i.Items)
            .FirstAsync(i => i.Id == itinerary.Id, ct);
        return Map(full);
    }

    /// <summary>
    /// Fallback: rule-based generation (original logic)
    /// </summary>
    public async Task<ItineraryDto?> GenerateAsync(int userId, GenerateItineraryRequest req, CancellationToken ct = default)
    {
        var trip = await db.Trips
            .Include(t => t.TripDestinations)
            .FirstOrDefaultAsync(t => t.Id == req.TripId && t.UserId == userId, ct);
        if (trip is null) return null;

        foreach (var did in req.DestinationIds)
        {
            var onTrip = trip.TripDestinations.Any(td => td.DestinationId == did);
            if (!onTrip) return null;
        }

        var destinations = await db.Destinations.AsNoTracking()
            .Where(d => req.DestinationIds.Contains(d.Id))
            .ToListAsync(ct);
        if (destinations.Count != req.DestinationIds.Length) return null;

        var activitiesPerDay = req.TravelStyle switch
        {
            "Relaxed" => 2,
            "Packed" => 4,
            _ => 3
        };

        var budgetMult = req.Budget switch
        {
            "Budget" => 0.4m,
            "Luxury" => 2.5m,
            _ => 1m
        };

        var totalDays = Math.Max(1, (trip.EndDate.Date - trip.StartDate.Date).Days + 1);
        var destCycle = req.DestinationIds;

        var itinerary = new Itinerary
        {
            Title = $"AI Plan — {trip.Title}",
            Description = string.IsNullOrWhiteSpace(req.Preferences) ? "Rule-based generated itinerary." : req.Preferences,
            IsAiGenerated = true,
            UserId = userId,
            TripId = trip.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Itineraries.Add(itinerary);
        await db.SaveChangesAsync(ct);

        var templates = new (string Type, string Title, string Desc, TimeSpan Start, TimeSpan End)[]
        {
            ("Sightseeing", "Morning exploration", "Scenic walk and photo spots.", TimeSpan.FromHours(9), TimeSpan.FromHours(11)),
            ("Food", "Local flavors", "Lunch at a highly rated local spot.", TimeSpan.FromHours(12), TimeSpan.FromHours(13.5)),
            ("Cultural", "Museum or heritage", "Immerse in history and art.", TimeSpan.FromHours(14), TimeSpan.FromHours(16)),
            ("Adventure", "Active outing", "Outdoor activity matched to the area.", TimeSpan.FromHours(16.5), TimeSpan.FromHours(18)),
            ("Rest", "Downtime", "Relax at your stay or a quiet café.", TimeSpan.FromHours(18.5), TimeSpan.FromHours(19.5)),
            ("Shopping", "Neighborhood browse", "Markets and boutique finds.", TimeSpan.FromHours(15), TimeSpan.FromHours(16.5)),
            ("Transport", "Getting around", "Transfers between highlights.", TimeSpan.FromHours(8), TimeSpan.FromHours(9)),
            ("Food", "Evening dining", "Sunset dinner with regional dishes.", TimeSpan.FromHours(19), TimeSpan.FromHours(21))
        };

        var sort = 0;
        for (var day = 1; day <= totalDays; day++)
        {
            var destId = destCycle[(day - 1) % destCycle.Length];
            var dest = destinations.First(d => d.Id == destId);
            var baseCost = dest.AverageCostPerDay / activitiesPerDay * budgetMult;

            for (var a = 0; a < activitiesPerDay; a++)
            {
                var tpl = templates[(day + a) % templates.Length];
                var cost = Math.Round(baseCost * (0.6m + 0.15m * a), 2);
                db.ItineraryItems.Add(new ItineraryItem
                {
                    ItineraryId = itinerary.Id,
                    DayNumber = day,
                    Title = $"{tpl.Title} in {dest.City}",
                    Description = $"{tpl.Desc} Notes: {dest.Name}.",
                    ActivityType = tpl.Type,
                    StartTime = tpl.Start,
                    EndTime = tpl.End,
                    Location = $"{dest.City}, {dest.Country}",
                    EstimatedCost = cost,
                    Notes = req.Preferences,
                    SortOrder = sort++,
                    DestinationId = destId
                });
            }
        }

        await db.SaveChangesAsync(ct);

        var full = await db.Itineraries.AsNoTracking()
            .Include(i => i.Items)
            .FirstAsync(i => i.Id == itinerary.Id, ct);
        return Map(full);
    }

    public async Task<bool> DeleteAsync(int itineraryId, int userId, CancellationToken ct = default)
    {
        var i = await db.Itineraries.FirstOrDefaultAsync(x => x.Id == itineraryId && x.UserId == userId, ct);
        if (i is null) return false;
        db.Itineraries.Remove(i);
        await db.SaveChangesAsync(ct);
        return true;
    }

    static TimeSpan ParseTime(string? time)
    {
        if (string.IsNullOrEmpty(time)) return TimeSpan.FromHours(9);
        if (TimeSpan.TryParse(time, out var ts)) return ts;
        var parts = time.Split(':');
        if (parts.Length >= 2 && int.TryParse(parts[0], out var h) && int.TryParse(parts[1], out var m))
            return new TimeSpan(h, m, 0);
        return TimeSpan.FromHours(9);
    }

    static ItineraryDto Map(Itinerary i) => new()
    {
        Id = i.Id,
        Title = i.Title,
        Description = i.Description,
        IsAiGenerated = i.IsAiGenerated,
        TripId = i.TripId,
        CreatedAt = i.CreatedAt,
        Items = i.Items
            .OrderBy(x => x.DayNumber).ThenBy(x => x.SortOrder)
            .Select(x => new ItineraryItemDto
            {
                Id = x.Id,
                DayNumber = x.DayNumber,
                Title = x.Title,
                Description = x.Description,
                ActivityType = x.ActivityType,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                Location = x.Location,
                EstimatedCost = x.EstimatedCost,
                Notes = x.Notes,
                DestinationId = x.DestinationId
            })
            .ToList()
    };
}
