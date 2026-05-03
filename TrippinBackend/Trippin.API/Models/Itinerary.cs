namespace Trippin.API.Models;

public class Itinerary
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsAiGenerated { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ItineraryItem> Items { get; set; } = new List<ItineraryItem>();
}
