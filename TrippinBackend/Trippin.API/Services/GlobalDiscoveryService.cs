using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Models;

namespace Trippin.API.Services;

/// <summary>
/// Dynamically discovers global destinations from external APIs
/// and caches them permanently in the local database.
/// The DB becomes a "smart cache" — not the source of truth.
/// </summary>
public class GlobalDiscoveryService(
    HttpClient httpClient,
    IConfiguration config,
    IServiceScopeFactory scopeFactory,
    PexelsService pexels,
    IMemoryCache cache)
{
    private readonly string _rapidApiKey = config["RapidAPI:Key"] ?? "";
    private readonly string _rapidApiHost = config["RapidAPI:HotelHost"] ?? "booking-com15.p.rapidapi.com";

    /// <summary>
    /// Search for destinations globally. First checks DB, then falls back to
    /// Booking.com geocoding API + Pexels for images. Results are permanently
    /// saved to the DB so subsequent searches are instant.
    /// </summary>
    public async Task<List<DestinationListDto>> DiscoverAsync(string query, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return new List<DestinationListDto>();

        var cacheKey = $"discover_{query.Trim().ToLowerInvariant()}";

        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(6);

            try
            {
                // Step 1: Call Booking.com destination search
                var request = new HttpRequestMessage(HttpMethod.Get,
                    $"https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query={Uri.EscapeDataString(query)}");
                request.Headers.Add("X-RapidAPI-Key", _rapidApiKey);
                request.Headers.Add("X-RapidAPI-Host", _rapidApiHost);

                var response = await httpClient.SendAsync(request, ct);
                var content = await response.Content.ReadAsStringAsync(ct);
                var json = JsonSerializer.Deserialize<JsonElement>(content);

                if (!json.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
                    return new List<DestinationListDto>();

                var results = new List<DestinationListDto>();

                // Step 2: Parse the API response into destination candidates
                foreach (var item in data.EnumerateArray().Take(6))
                {
                    try
                    {
                        var name = item.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
                        var destType = item.TryGetProperty("dest_type", out var dt) ? dt.GetString() ?? "" : "";
                        var country = item.TryGetProperty("country", out var c) ? c.GetString() ?? "" : "";
                        var cityName = item.TryGetProperty("city_name", out var cn) ? cn.GetString() : null;
                        var label = item.TryGetProperty("label", out var lb) ? lb.GetString() ?? name : name;
                        var latitude = item.TryGetProperty("latitude", out var lat) ? lat.GetDouble() : 0;
                        var longitude = item.TryGetProperty("longitude", out var lng) ? lng.GetDouble() : 0;

                        // Skip if no meaningful name
                        if (string.IsNullOrWhiteSpace(name)) continue;

                        // Determine display name & city
                        var displayName = name;
                        var city = cityName ?? name;

                        // Classify category from dest_type
                        var category = destType switch
                        {
                            "city" => "city",
                            "region" => "nature",
                            "landmark" => "cultural",
                            "airport" => "city",
                            _ => "city"
                        };

                        // Step 3: Check if this destination already exists in DB
                        using var scope = scopeFactory.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        var existing = await db.Destinations
                            .AsNoTracking()
                            .FirstOrDefaultAsync(d =>
                                d.Name.ToLower() == displayName.ToLower() &&
                                d.Country.ToLower() == country.ToLower(), ct);

                        if (existing != null)
                        {
                            // Already in DB — return it directly
                            results.Add(new DestinationListDto
                            {
                                Id = existing.Id,
                                Name = existing.Name,
                                Country = existing.Country,
                                City = existing.City,
                                Category = existing.Category,
                                ThumbnailUrl = existing.ThumbnailUrl,
                                AverageCostPerDay = existing.AverageCostPerDay,
                                Currency = existing.Currency,
                                IsPopular = existing.IsPopular,
                            });
                            continue;
                        }

                        // Step 4: Fetch images from Pexels
                        var (heroUrl, thumbUrl) = await pexels.GetDestinationImagesAsync(
                            $"{displayName} {country} travel landmark", ct);

                        // Step 5: Insert into database as a new dynamic destination
                        var newDest = new Destination
                        {
                            Name = displayName,
                            Country = country,
                            City = city,
                            Description = $"Discover {displayName}, a beautiful destination in {country}. Explore local culture, landmarks, and experiences.",
                            Category = category,
                            ImageUrl = heroUrl,
                            ThumbnailUrl = thumbUrl,
                            Latitude = latitude,
                            Longitude = longitude,
                            AverageCostPerDay = EstimateCost(country),
                            Currency = "USD",
                            Tags = $"{category},travel,{country.ToLower()}",
                            Highlights = $"Explore {displayName}|Local cuisine|Cultural sites",
                            BestTimeToVisit = "Year-round",
                            IsPopular = false,
                            CreatedAt = DateTime.UtcNow
                        };

                        db.Destinations.Add(newDest);
                        await db.SaveChangesAsync(ct);

                        results.Add(new DestinationListDto
                        {
                            Id = newDest.Id,
                            Name = newDest.Name,
                            Country = newDest.Country,
                            City = newDest.City,
                            Category = newDest.Category,
                            ThumbnailUrl = newDest.ThumbnailUrl,
                            AverageCostPerDay = newDest.AverageCostPerDay,
                            Currency = newDest.Currency,
                            IsPopular = false,
                        });
                    }
                    catch { continue; }
                }

                Console.WriteLine($"[GlobalDiscovery] Discovered {results.Count} destinations for '{query}'");
                return results;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GlobalDiscovery] Error: {ex.Message}");
                return new List<DestinationListDto>();
            }
        }) ?? new List<DestinationListDto>();
    }

    /// <summary>
    /// Rough cost-of-living estimate by country for auto-populated destinations.
    /// </summary>
    private static decimal EstimateCost(string country) => country.ToLowerInvariant() switch
    {
        "united states" or "australia" or "switzerland" or "norway" or "iceland" => 200,
        "united kingdom" or "france" or "germany" or "japan" or "canada" => 160,
        "spain" or "italy" or "greece" or "portugal" or "south korea" => 120,
        "thailand" or "vietnam" or "indonesia" or "mexico" or "turkey" => 60,
        "india" or "nepal" or "cambodia" or "egypt" or "morocco" => 35,
        _ => 100
    };
}
