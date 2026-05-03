namespace Trippin.API.Models;

public class TripDestination
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public int DestinationId { get; set; }
    public Destination Destination { get; set; } = null!;
    public int VisitOrder { get; set; }
    public int DaysToSpend { get; set; } = 1;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
