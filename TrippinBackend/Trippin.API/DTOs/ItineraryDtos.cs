using System.ComponentModel.DataAnnotations;

namespace Trippin.API.DTOs;

public class GenerateItineraryRequest
{
    [Required]
    public int TripId { get; set; }

    [Required, MinLength(1)]
    public int[] DestinationIds { get; set; } = Array.Empty<int>();

    [Required]
    [RegularExpression("Relaxed|Moderate|Packed")]
    public string TravelStyle { get; set; } = "Moderate";

    [Required]
    [RegularExpression("Budget|Mid|Luxury")]
    public string Budget { get; set; } = "Mid";

    [MaxLength(2000)]
    public string? Preferences { get; set; }
}

public class ItineraryItemDto
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
    public int? DestinationId { get; set; }
}

public class ItineraryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsAiGenerated { get; set; }
    public int TripId { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<ItineraryItemDto> Items { get; set; } = Array.Empty<ItineraryItemDto>();
}

public class ItinerarySummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsAiGenerated { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
