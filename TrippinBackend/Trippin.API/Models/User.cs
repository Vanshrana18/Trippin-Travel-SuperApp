namespace Trippin.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? Country { get; set; }
    public string? GoogleId { get; set; }
    public string? GitHubId { get; set; }
    public string? MicrosoftId { get; set; }
    public string AuthProvider { get; set; } = "Local";
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Itinerary> Itineraries { get; set; } = new List<Itinerary>();
}
