using System.Net.Http.Headers;
using System.Text.Json;

namespace Trippin.API.Services;

public class PexelsService(HttpClient httpClient, IConfiguration config)
{
    private readonly string? _apiKey = config["Pexels:ApiKey"];

    /// <summary>
    /// Searches Pexels for a photo matching the query (e.g., "Amazon Rainforest")
    /// Returns a tuple of (heroImageUrl, thumbnailUrl) or (null, null) if failed or missing key.
    /// </summary>
    public async Task<(string? HeroUrl, string? ThumbnailUrl)> GetDestinationImagesAsync(string query, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey == "YOUR_PEXELS_API_KEY")
        {
            Console.WriteLine("Pexels API Key is missing. Skipping dynamic image fetch.");
            return (null, null);
        }

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.pexels.com/v1/search?query={Uri.EscapeDataString(query)}&per_page=1&orientation=landscape");
            request.Headers.Authorization = new AuthenticationHeaderValue(_apiKey);

            var response = await httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Pexels API Error: {response.StatusCode}");
                return (null, null);
            }

            var content = await response.Content.ReadAsStringAsync(ct);
            var doc = JsonSerializer.Deserialize<JsonElement>(content);

            var photos = doc.GetProperty("photos");
            if (photos.GetArrayLength() == 0) return (null, null);

            var photo = photos[0];
            var src = photo.GetProperty("src");

            var hero = src.GetProperty("large2x").GetString(); // High res
            var thumb = src.GetProperty("medium").GetString(); // Low res

            return (hero, thumb);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to fetch from Pexels: {ex.Message}");
            return (null, null);
        }
    }
}
