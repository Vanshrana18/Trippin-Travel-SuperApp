namespace Trippin.API.Models;

public class Destination
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal AverageCostPerDay { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Tags { get; set; }
    public string? Highlights { get; set; }
    public string BestTimeToVisit { get; set; } = string.Empty;
    public bool IsPopular { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TripDestination> TripDestinations { get; set; } = new List<TripDestination>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<ItineraryItem> ItineraryItems { get; set; } = new List<ItineraryItem>();
}
