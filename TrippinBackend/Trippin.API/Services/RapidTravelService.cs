using System.Net.Http.Json;
using System.Text.Json;
using Trippin.API.DTOs;
using Microsoft.Extensions.Caching.Memory;

namespace Trippin.API.Services;

public class RapidTravelService(HttpClient httpClient, IConfiguration config, IMemoryCache cache)
{
    private readonly string _apiKey = config["RapidAPI:Key"] ?? throw new Exception("RapidAPI Key missing");

    private async Task<(string id, string type)> ResolveLocationAsync(string query, CancellationToken ct)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query={query}");
            request.Headers.Add("X-RapidAPI-Key", _apiKey);
            request.Headers.Add("X-RapidAPI-Host", config["RapidAPI:HotelHost"]);

            var response = await httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);
            var json = JsonSerializer.Deserialize<JsonElement>(content);

            if (json.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array && data.GetArrayLength() > 0)
            {
                var first = data[0];
                return (first.GetProperty("dest_id").GetString() ?? "", first.GetProperty("dest_type").GetString() ?? "city");
            }
        }
        catch { }
        return (query, "city");
    }

    public async Task<List<FlightSearchResult>> SearchFlightsAsync(string from, string to, DateTime departDate, string currency = "USD", CancellationToken ct = default)
    {
        var cacheKey = $"flights_{from}_{to}_{departDate:yyyyMMdd}_{currency}";
        
        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12);
            try
            {
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId={from}.AIRPORT&toId={to}.AIRPORT&departDate={departDate:yyyy-MM-dd}&adults={adults}&sort=CHEAPEST&currencyCode={currency}");
            
            request.Headers.Add("X-RapidAPI-Key", _apiKey);
            request.Headers.Add("X-RapidAPI-Host", config["RapidAPI:FlightHost"]);

            var response = await httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);
            var data = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<FlightSearchResult>();

            JsonElement list = default;
            if (data.TryGetProperty("data", out var d) && d.TryGetProperty("flightOffers", out list)) { /* found */ }

            if (list.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in list.EnumerateArray().Take(40))
                {
                    try {
                        var itinerary = item.GetProperty("itineraries")[0];
                        var segments = itinerary.GetProperty("segments");
                        var firstSegment = segments[0];
                        var durationStr = (itinerary.TryGetProperty("duration", out var dur) ? dur.GetString()?.Replace("PT", "").ToLower() : "8h") ?? "8h";
                        int stops = segments.GetArrayLength() - 1;

                        results.Add(new FlightSearchResult
                        {
                            Airline = firstSegment.GetProperty("carrierName").GetString() ?? "Airline",
                            FlightNumber = firstSegment.GetProperty("flightNumber").GetString() ?? "FL123",
                            Origin = from,
                            Destination = to,
                            DepartureTime = DateTime.Parse(firstSegment.GetProperty("departureTime").GetString()!),
                            ArrivalTime = DateTime.Parse(segments[segments.GetArrayLength() - 1].GetProperty("arrivalTime").GetString()!),
                            Duration = durationStr ?? "8h",
                            Stops = stops,
                            Price = item.GetProperty("price").GetProperty("total").GetDecimal(),
                            Currency = currency
                        });
                    } catch { continue; }
                }
            }
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RapidAPI Flight Error: {ex.Message}");
            return new List<FlightSearchResult>();
        }
        }) ?? new List<FlightSearchResult>();
    }

    public async Task<List<HotelSearchResult>> SearchHotelsAsync(string query, DateTime checkIn, DateTime checkOut, string currency = "USD", CancellationToken ct = default)
    {
        var cacheKey = $"hotels_{query}_{checkIn:yyyyMMdd}_{checkOut:yyyyMMdd}_{currency}";

        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12);
            try
            {
            // Step 1: Resolve City Query to dest_id
            var (destId, destType) = await ResolveLocationAsync(query, ct);

            // Step 2: Search Hotels
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id={destId}&search_type={destType}&arrival_date={checkIn:yyyy-MM-dd}&departure_date={checkOut:yyyy-MM-dd}&adults={adults}&children_age=0&room_qty=1&page_number=1&units=metric&temperature_unit=c&languagecode=en-us&currency_code={currency}");
            
            request.Headers.Add("X-RapidAPI-Key", _apiKey);
            request.Headers.Add("X-RapidAPI-Host", config["RapidAPI:HotelHost"]);

            var response = await httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);
            var json = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<HotelSearchResult>();

            if (json.TryGetProperty("data", out var d) && d.TryGetProperty("hotels", out var list))
            {
                foreach (var item in list.EnumerateArray().Take(40))
                {
                    try {
                        // In booking-com15, most data is inside the 'property' object
                        item.TryGetProperty("property", out var prop);
                        
                        var name = prop.TryGetProperty("name", out var n) ? n.GetString() : item.TryGetProperty("hotel_name", out var hn) ? hn.GetString() : "Hotel";
                        var photoUrl = prop.TryGetProperty("photoUrls", out var photos) && photos.GetArrayLength() > 0 ? photos[0].GetString() : item.TryGetProperty("main_photo_url", out var img) ? img.GetString() : null;

                        results.Add(new HotelSearchResult
                        {
                            Name = name ?? "Hotel",
                            Address = prop.TryGetProperty("wishlistName", out var addr) ? addr.GetString() ?? "" : "",
                            StarRating = prop.TryGetProperty("propertyClass", out var cls) ? (int)cls.GetDouble() : 4,
                            PricePerNight = item.TryGetProperty("price_breakdown", out var pb) ? pb.GetProperty("all_inclusive_price").GetDecimal() : 150,
                            Currency = currency,
                            ImageUrl = photoUrl,
                            Rating = prop.TryGetProperty("reviewScore", out var score) ? score.GetDouble() : null,
                            BookingUrl = $"https://www.booking.com/hotel/xx/{item.GetProperty("hotel_id").GetInt32()}.html"
                        });
                    } catch { continue; }
                }
            }
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RapidAPI Hotel Error: {ex.Message}");
            return new List<HotelSearchResult>();
        }
        }) ?? new List<HotelSearchResult>();
    }

    public async Task<List<TaxiSearchResult>> SearchTaxisAsync(string fromLocation, string toLocation, DateTime pickupTime, string currency = "USD", CancellationToken ct = default)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://booking-com15.p.rapidapi.com/api/v1/taxi/searchTaxi?fromLocation={fromLocation}&toLocation={toLocation}&pickupTime={pickupTime:yyyy-MM-dd HH:mm:ss}&currencyCode={currency}");
            
            request.Headers.Add("X-RapidAPI-Key", _apiKey);
            request.Headers.Add("X-RapidAPI-Host", config["RapidAPI:TaxiHost"]);

            var response = await httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);
            var json = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<TaxiSearchResult>();

            if (json.TryGetProperty("data", out var d) && d.TryGetProperty("results", out var list))
            {
                foreach (var item in list.EnumerateArray().Take(20))
                {
                    try {
                        results.Add(new TaxiSearchResult
                        {
                            Company = item.TryGetProperty("supplier_name", out var s) ? s.GetString() ?? "Taxi" : "Taxi",
                            CarType = item.TryGetProperty("vehicle_type", out var v) ? v.GetString() ?? "Sedan" : "Sedan",
                            EstimatedTime = "30-45 mins",
                            Price = item.TryGetProperty("price", out var p) ? p.GetProperty("total").GetDecimal() : 50,
                            Currency = currency,
                            ImageUrl = item.TryGetProperty("vehicle_image", out var img) ? img.GetString() ?? "" : ""
                        });
                    } catch { continue; }
                }
            }
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RapidAPI Taxi Error: {ex.Message}");
            return new List<TaxiSearchResult>();
        }
    }

    public async Task<List<TrainSearchResult>> SearchTrainsAsync(string sourceStation, string destStation, DateTime date, CancellationToken ct = default)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://indian-railway-irctc.p.rapidapi.com/api/v1/searchTrain?sourceStation={sourceStation}&destinationStation={destStation}&date={date:yyyy-MM-dd}");
            
            request.Headers.Add("X-RapidAPI-Key", _apiKey);
            request.Headers.Add("X-RapidAPI-Host", config["RapidAPI:TrainHost"]);

            var response = await httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);
            var data = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<TrainSearchResult>();

            if (data.TryGetProperty("data", out var list) && list.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in list.EnumerateArray().Take(20))
                {
                    results.Add(new TrainSearchResult
                    {
                        TrainName = item.TryGetProperty("train_name", out var tn) ? tn.GetString() ?? "Express" : "Express",
                        TrainNumber = item.TryGetProperty("train_number", out var tnum) ? tnum.GetString() ?? "00000" : "00000",
                        DepartureStation = item.TryGetProperty("source_station_name", out var ssn) ? ssn.GetString() ?? sourceStation : sourceStation,
                        ArrivalStation = item.TryGetProperty("destination_station_name", out var dsn) ? dsn.GetString() ?? destStation : destStation,
                        DepartureTime = item.TryGetProperty("run_days", out var rd) ? rd.GetString() ?? "10:00 AM" : "10:00 AM",
                        ArrivalTime = "06:00 PM",
                        Duration = "8h 0m",
                        Class = "3A",
                        Price = 1200,
                        Currency = "INR"
                    });
                }
            }
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RapidAPI Train Error: {ex.Message}");
            return new List<TrainSearchResult>();
        }
    }
}
