namespace Trippin.API.Models;

public class ItineraryItem
{
    public int Id { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ActivityType { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Location { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? Notes { get; set; }
    public int SortOrder { get; set; }
    public int ItineraryId { get; set; }
    public Itinerary Itinerary { get; set; } = null!;
    public int? DestinationId { get; set; }
    public Destination? Destination { get; set; }
}
