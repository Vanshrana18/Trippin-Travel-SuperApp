namespace Trippin.API.Models;

public class Trip
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Planning";
    public decimal Budget { get; set; }
    public string Currency { get; set; } = "USD";
    public string? CoverImageUrl { get; set; }
    public int TravelersCount { get; set; } = 1;
    public bool IsPublic { get; set; }
    public bool IsDeleted { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TripDestination> TripDestinations { get; set; } = new List<TripDestination>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Itinerary> Itineraries { get; set; } = new List<Itinerary>();
}
