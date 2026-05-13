using System.Net.Http.Json;
using System.Text.Json;
using Trippin.API.DTOs;
using Microsoft.Extensions.Caching.Memory;

namespace Trippin.API.Services;

public class RapidTravelService(HttpClient httpClient, IConfiguration config, IMemoryCache cache)
{
    private readonly string _apiKey = config["RapidAPI:Key"] ?? throw new Exception("RapidAPI Key missing");
    private readonly string _bookingHost = config["RapidAPI:HotelHost"] ?? "booking-com15.p.rapidapi.com";
    private readonly string _trainHost = config["RapidAPI:TrainHost"] ?? "irctc1.p.rapidapi.com";

    // Centralized HTTP helper with proper retry (creates a fresh request each time)
    private async Task<string> CallApiAsync(string url, string host, CancellationToken ct, int maxRetries = 2)
    {
        for (int attempt = 0; attempt <= maxRetries; attempt++)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("X-RapidAPI-Key", _apiKey);
            request.Headers.Add("X-RapidAPI-Host", host);

            var response = await httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);

            if (response.IsSuccessStatusCode)
            {
                return content;
            }

            Console.WriteLine($"[API] HTTP {(int)response.StatusCode} from {host} (attempt {attempt + 1}/{maxRetries + 1})");

            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests && attempt < maxRetries)
            {
                var delay = (attempt + 1) * 2000; // 2s, 4s
                Console.WriteLine($"[API] Rate limited. Waiting {delay}ms before retry...");
                await Task.Delay(delay, ct);
                continue;
            }

            // For non-429 errors or final retry, return what we got
            return content;
        }

        return "{}";
    }

    private async Task<(string id, string type)> ResolveLocationAsync(string query, CancellationToken ct)
    {
        var cacheKey = $"loc_{query.ToLower().Trim()}";
        if (cache.TryGetValue(cacheKey, out (string id, string type) cached)) return cached;

        try
        {
            Console.WriteLine($"[TRANS] Resolving Hotel Location: {query}...");
            var content = await CallApiAsync(
                $"https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query={Uri.EscapeDataString(query)}",
                _bookingHost, ct);

            var json = JsonSerializer.Deserialize<JsonElement>(content);

            if (json.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array && data.GetArrayLength() > 0)
            {
                var first = data[0];
                var id = first.GetProperty("dest_id").GetString() ?? "";
                var type = first.GetProperty("dest_type").GetString() ?? "city";
                var result = (id, type);
                cache.Set(cacheKey, result, TimeSpan.FromDays(7));
                Console.WriteLine($"[TRANS] Resolved '{query}' -> dest_id={id}, type={type}");
                return result;
            }
            Console.WriteLine($"[TRANS] No results for hotel location '{query}'. Raw: {content[..Math.Min(200, content.Length)]}");
        }
        catch (Exception ex) { Console.WriteLine($"[TRANS] Hotel Resolve Error: {ex.Message}"); }
        return (query, "city");
    }

    private async Task<string> ResolveFlightLocationAsync(string query, CancellationToken ct)
    {
        var cacheKey = $"flight_loc_{query.ToLower().Trim()}";
        if (cache.TryGetValue(cacheKey, out string? cached) && cached != null) return cached;

        try
        {
            Console.WriteLine($"[TRANS] Resolving Flight Location: {query}...");
            var content = await CallApiAsync(
                $"https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination?query={Uri.EscapeDataString(query)}",
                _bookingHost, ct);

            var json = JsonSerializer.Deserialize<JsonElement>(content);

            if (json.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array && data.GetArrayLength() > 0)
            {
                var first = data[0];
                string? id = null;
                if (first.TryGetProperty("id", out var idProp)) id = idProp.GetString();
                if (string.IsNullOrEmpty(id) && first.TryGetProperty("iataCode", out var iata)) id = iata.GetString();
                
                var resolved = id ?? query;
                cache.Set(cacheKey, resolved, TimeSpan.FromDays(7));
                Console.WriteLine($"[TRANS] Resolved '{query}' -> Flight ID: {resolved}");
                return resolved;
            }
            Console.WriteLine($"[TRANS] No results for flight location '{query}'. Raw: {content[..Math.Min(200, content.Length)]}");
        }
        catch (Exception ex) { Console.WriteLine($"[TRANS] Flight Resolve Error: {ex.Message}"); }
        return query;
    }

    private async Task<string> ResolveTrainStationAsync(string query, CancellationToken ct)
    {
        var cacheKey = $"train_loc_{query.ToLower().Trim()}";
        if (cache.TryGetValue(cacheKey, out string? cached) && cached != null) return cached;

        try
        {
            Console.WriteLine($"[TRANS] Resolving Train Station: {query}...");
            var content = await CallApiAsync(
                $"https://irctc1.p.rapidapi.com/api/v1/searchStation?query={Uri.EscapeDataString(query)}",
                _trainHost, ct);

            var json = JsonSerializer.Deserialize<JsonElement>(content);

            if (json.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array && data.GetArrayLength() > 0)
            {
                var resolved = data[0].GetProperty("stationCode").GetString() ?? query;
                cache.Set(cacheKey, resolved, TimeSpan.FromDays(7));
                Console.WriteLine($"[TRANS] Resolved '{query}' -> Station: {resolved}");
                return resolved;
            }
            Console.WriteLine($"[TRANS] No results for station '{query}'. Raw: {content[..Math.Min(200, content.Length)]}");
        }
        catch (Exception ex) { Console.WriteLine($"[TRANS] Train Resolve Error: {ex.Message}"); }
        return query;
    }

    public async Task<List<FlightSearchResult>> SearchFlightsAsync(string from, string to, DateTime departDate, string currency = "USD", int adults = 1, CancellationToken ct = default)
    {
        var cacheKey = $"flights_{from}_{to}_{departDate:yyyyMMdd}_{currency}_{adults}";
        if (cache.TryGetValue(cacheKey, out List<FlightSearchResult>? cached) && cached != null && cached.Count > 0) return cached;
        
        try
        {
            var fromId = await ResolveFlightLocationAsync(from, ct);
            var toId = await ResolveFlightLocationAsync(to, ct);

            if (!fromId.Contains(".")) fromId += ".AIRPORT";
            if (!toId.Contains(".")) toId += ".AIRPORT";

            Console.WriteLine($"[API] Searching Flights: {fromId} -> {toId} on {departDate:yyyy-MM-dd}...");

            var content = await CallApiAsync(
                $"https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId={fromId}&toId={toId}&departDate={departDate:yyyy-MM-dd}&adults={adults}&sort=CHEAPEST&currencyCode={currency}",
                _bookingHost, ct);

            var data = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<FlightSearchResult>();

            JsonElement list = default;
            if (data.TryGetProperty("data", out var d))
            {
                if (d.TryGetProperty("flightOffers", out var fo)) list = fo;
                else if (d.ValueKind == JsonValueKind.Array) list = d;
            }

            if (list.ValueKind == JsonValueKind.Array)
            {
                Console.WriteLine($"[API] Parsing {list.GetArrayLength()} flight offers...");
                foreach (var item in list.EnumerateArray().Take(40))
                {
                    try {
                        var itins = item.TryGetProperty("itineraries", out var i) ? i : default;
                        var segments = (itins.ValueKind == JsonValueKind.Array && itins.GetArrayLength() > 0) ? itins[0].GetProperty("segments") : default;
                        var firstSeg = (segments.ValueKind == JsonValueKind.Array && segments.GetArrayLength() > 0) ? segments[0] : default;

                        results.Add(new FlightSearchResult
                        {
                            Airline = firstSeg.TryGetProperty("carrierName", out var cn) ? cn.GetString() ?? "Airline" : "Airline",
                            FlightNumber = firstSeg.TryGetProperty("flightNumber", out var fn) ? fn.GetString() ?? "FL123" : "FL123",
                            Origin = from,
                            Destination = to,
                            DepartureTime = firstSeg.TryGetProperty("departureTime", out var dt) ? dt.GetDateTime() : departDate,
                            ArrivalTime = segments[segments.GetArrayLength()-1].TryGetProperty("arrivalTime", out var at) ? at.GetDateTime() : departDate.AddHours(2),
                            Duration = itins[0].TryGetProperty("duration", out var dur) ? dur.GetString()?.Replace("PT","").ToLower() ?? "3h" : "3h",
                            Price = item.GetProperty("price").GetProperty("total").GetDecimal(),
                            Currency = currency,
                            Stops = (segments.ValueKind == JsonValueKind.Array) ? segments.GetArrayLength() - 1 : 0
                        });
                    } catch (Exception ex) { 
                        Console.WriteLine($"[API] Skipping flight offer: {ex.Message}");
                        continue; 
                    }
                }
            }
            else
            {
                Console.WriteLine($"[API] No flight offers found in response. Raw: {content[..Math.Min(300, content.Length)]}");
            }

            if (results.Count > 0) cache.Set(cacheKey, results, TimeSpan.FromHours(1));
            Console.WriteLine($"[API] Found {results.Count} flights.");
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[API] RapidAPI Flight Error: {ex.Message}");
            return new List<FlightSearchResult>();
        }
    }

    public async Task<List<HotelSearchResult>> SearchHotelsAsync(string query, DateTime checkIn, DateTime checkOut, string currency = "USD", int adults = 1, CancellationToken ct = default)
    {
        var cacheKey = $"hotels_{query}_{checkIn:yyyyMMdd}_{checkOut:yyyyMMdd}_{currency}_{adults}";
        if (cache.TryGetValue(cacheKey, out List<HotelSearchResult>? cached) && cached != null && cached.Count > 0) return cached;

        try
        {
            var (destId, destType) = await ResolveLocationAsync(query, ct);
            Console.WriteLine($"[API] Searching Hotels: dest_id={destId}, type={destType}, {checkIn:yyyy-MM-dd} to {checkOut:yyyy-MM-dd}...");

            var content = await CallApiAsync(
                $"https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id={destId}&search_type={destType}&arrival_date={checkIn:yyyy-MM-dd}&departure_date={checkOut:yyyy-MM-dd}&adults={adults}&children_age=0&room_qty=1&page_number=1&units=metric&temperature_unit=c&languagecode=en-us&currency_code={currency}",
                _bookingHost, ct);

            var json = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<HotelSearchResult>();

            JsonElement list = default;
            if (json.TryGetProperty("data", out var d))
            {
                if (d.TryGetProperty("hotels", out var h)) list = h;
                else if (d.TryGetProperty("results", out var r)) list = r;
            }

            if (list.ValueKind == JsonValueKind.Array)
            {
                Console.WriteLine($"[API] Parsing {list.GetArrayLength()} hotels...");
                foreach (var item in list.EnumerateArray().Take(40))
                {
                    try {
                        var prop = item.TryGetProperty("property", out var p) ? p : item;
                        var name = item.TryGetProperty("name", out var n) ? n.GetString() : (prop.TryGetProperty("name", out var pn) ? pn.GetString() : "Hotel");
                        
                        decimal price = 0;
                        if (item.TryGetProperty("priceBreakdown", out var pb))
                        {
                            if (pb.TryGetProperty("grossAmount", out var ga) && ga.TryGetProperty("value", out var gav))
                                price = gav.GetDecimal();
                            else if (pb.TryGetProperty("grossPrice", out var gp) && gp.TryGetProperty("value", out var gpv))
                                price = gpv.GetDecimal();
                        }
                        else if (item.TryGetProperty("price", out var pr) && pr.ValueKind == JsonValueKind.Number)
                            price = pr.GetDecimal();

                        // Get hotel ID safely
                        int hotelId = 0;
                        if (item.TryGetProperty("hotel_id", out var hid))
                        {
                            if (hid.ValueKind == JsonValueKind.Number) hotelId = hid.GetInt32();
                            else if (hid.ValueKind == JsonValueKind.String && int.TryParse(hid.GetString(), out var parsed)) hotelId = parsed;
                        }

                        results.Add(new HotelSearchResult
                        {
                            Name = name ?? "Hotel",
                            Address = prop.TryGetProperty("wishlistName", out var addr) ? addr.GetString() ?? "" : "City Center",
                            StarRating = prop.TryGetProperty("propertyClass", out var cls) ? (int)cls.GetDouble() : 4,
                            PricePerNight = price > 0 ? price : 150,
                            Currency = currency,
                            ImageUrl = prop.TryGetProperty("photoUrls", out var photos) && photos.GetArrayLength() > 0 ? photos[0].GetString() : null,
                            Rating = prop.TryGetProperty("reviewScore", out var score) ? score.GetDouble() : 4.5,
                            BookingUrl = hotelId > 0 ? $"https://www.booking.com/hotel/xx/{hotelId}.html" : "https://www.booking.com"
                        });
                    } catch (Exception ex) { 
                        Console.WriteLine($"[API] Skipping hotel: {ex.Message}");
                        continue; 
                    }
                }
            }
            else
            {
                Console.WriteLine($"[API] No hotels found in response. Raw: {content[..Math.Min(300, content.Length)]}");
            }

            if (results.Count > 0) cache.Set(cacheKey, results, TimeSpan.FromHours(1));
            Console.WriteLine($"[API] Found {results.Count} hotels.");
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[API] RapidAPI Hotel Error: {ex.Message}");
            return new List<HotelSearchResult>();
        }
    }

    public async Task<List<TaxiSearchResult>> SearchTaxisAsync(string fromLocation, string toLocation, DateTime pickupTime, string currency = "USD", CancellationToken ct = default)
    {
        try
        {
            var content = await CallApiAsync(
                $"https://booking-com15.p.rapidapi.com/api/v1/taxi/searchTaxi?fromLocation={Uri.EscapeDataString(fromLocation)}&toLocation={Uri.EscapeDataString(toLocation)}&pickupTime={pickupTime:yyyy-MM-dd HH:mm:ss}&currencyCode={currency}",
                _bookingHost, ct);

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
            Console.WriteLine($"[API] RapidAPI Taxi Error: {ex.Message}");
            return new List<TaxiSearchResult>();
        }
    }

    public async Task<List<TrainSearchResult>> SearchTrainsAsync(string sourceStation, string destStation, DateTime date, CancellationToken ct = default)
    {
        var cacheKey = $"trains_{sourceStation}_{destStation}_{date:yyyyMMdd}";
        if (cache.TryGetValue(cacheKey, out List<TrainSearchResult>? cached) && cached != null && cached.Count > 0) return cached;

        try
        {
            var fromCode = await ResolveTrainStationAsync(sourceStation, ct);
            var toCode = await ResolveTrainStationAsync(destStation, ct);

            Console.WriteLine($"[API] Searching Trains: {fromCode} -> {toCode} on {date:yyyy-MM-dd}...");

            var content = await CallApiAsync(
                $"https://irctc1.p.rapidapi.com/api/v1/searchTrain?sourceStation={fromCode}&destinationStation={toCode}&date={date:yyyy-MM-dd}",
                _trainHost, ct);

            var data = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<TrainSearchResult>();

            if (data.TryGetProperty("data", out var list) && list.ValueKind == JsonValueKind.Array)
            {
                Console.WriteLine($"[API] Parsing {list.GetArrayLength()} trains...");
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
            else
            {
                Console.WriteLine($"[API] No trains found. Raw: {content[..Math.Min(300, content.Length)]}");
            }

            if (results.Count > 0) cache.Set(cacheKey, results, TimeSpan.FromHours(1));
            Console.WriteLine($"[API] Found {results.Count} trains.");
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[API] RapidAPI Train Error: {ex.Message}");
            return new List<TrainSearchResult>();
        }
    }
}
