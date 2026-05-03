using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;

namespace Trippin.API.Services;

public class GeminiService(HttpClient httpClient, IConfiguration config, IMemoryCache cache)
{
    private readonly string _apiKey = config["Gemini:ApiKey"] ?? throw new Exception("Gemini API Key missing");
    private readonly string _model = config["Gemini:Model"] ?? "gemini-2.0-flash";

    public async Task<string> GenerateItineraryAsync(
        string destination,
        int totalDays,
        string travelStyle,
        string budget,
        string? preferences,
        CancellationToken ct = default)
    {
        var prompt = $"""
        You are a world-class travel planner AI. Create a detailed {totalDays}-day travel itinerary for {destination}.

        Travel Style: {travelStyle}
        Budget Level: {budget}
        {(string.IsNullOrEmpty(preferences) ? "" : $"Special Preferences: {preferences}")}

        IMPORTANT: Return ONLY a valid JSON array with NO markdown formatting, NO code fences, NO explanation text.
        Each item in the array must have exactly these fields:
        - "dayNumber": integer (1 to {totalDays})
        - "title": string (specific activity name, e.g. "Visit the Eiffel Tower")
        - "description": string (2-3 sentences describing what to do, local tips, and why it's worth visiting)
        - "activityType": string (one of: "Sightseeing", "Food", "Cultural", "Adventure", "Rest", "Shopping", "Transport")
        - "startTime": string (HH:mm format, e.g. "09:00")
        - "endTime": string (HH:mm format, e.g. "11:30")
        - "location": string (specific place name and area)
        - "estimatedCost": number (in USD, realistic for the budget level)

        Generate {(travelStyle == "Relaxed" ? 3 : travelStyle == "Packed" ? 5 : 4)} activities per day.
        Make each activity specific to {destination} — use real place names, real restaurants, real landmarks.
        Vary the activity types across the day. Start mornings with sightseeing, include local food spots for meals, and wind down with cultural or rest activities in the evening.
        Return ONLY the JSON array. No other text.
        """;

        // Generate a deterministic cache key using SHA256 of the prompt
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(prompt));
        var cacheKey = $"gemini_{Convert.ToBase64String(hashBytes)}";

        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24);


        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.8,
                maxOutputTokens = 4096,
                responseMimeType = "application/json"
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync(url, content, ct);
        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Gemini API Error: {response.StatusCode} — {responseBody}");
            throw new Exception($"Gemini API returned {response.StatusCode}");
        }

        // Extract the text from Gemini's response structure
        var doc = JsonSerializer.Deserialize<JsonElement>(responseBody);
        var text = doc
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "[]";

        // Clean any markdown fences just in case
        text = text.Trim();
        if (text.StartsWith("```"))
        {
            var firstNewline = text.IndexOf('\n');
            if (firstNewline > 0) text = text[(firstNewline + 1)..];
            if (text.EndsWith("```")) text = text[..^3];
            text = text.Trim();
        }
        Console.WriteLine($"Gemini returned {text.Length} chars of itinerary data");
        return text;
        }) ?? "[]";
    }
}
