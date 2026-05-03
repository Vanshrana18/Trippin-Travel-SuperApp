using System.ComponentModel.DataAnnotations;

namespace Trippin.API.DTOs;

public class CreateTripRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Budget { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "USD";

    [Url, MaxLength(2000)]
    public string? CoverImageUrl { get; set; }

    [Range(1, 100)]
    public int TravelersCount { get; set; } = 1;

    public bool IsPublic { get; set; }

    public int[]? DestinationIds { get; set; }
}

public class UpdateTripRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Budget { get; set; }

    [MaxLength(10)]
    public string? Currency { get; set; }

    [Url, MaxLength(2000)]
    public string? CoverImageUrl { get; set; }

    [Range(1, 100)]
    public int? TravelersCount { get; set; }

    public bool? IsPublic { get; set; }

    [RegularExpression("Planning|Active|Completed|Cancelled")]
    public string? Status { get; set; }
}

public class TripDestinationDto
{
    public int DestinationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public int VisitOrder { get; set; }
    public int DaysToSpend { get; set; }
    public string? Notes { get; set; }
}

public class TripListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public string Currency { get; set; } = "USD";
    public string? CoverImageUrl { get; set; }
    public int TravelersCount { get; set; }
    public bool IsPublic { get; set; }
    public int DestinationCount { get; set; }
    public int BookingCount { get; set; }
}

public class TripDetailDto : TripListDto
{
    public string Description { get; set; } = string.Empty;
    public IReadOnlyList<TripDestinationDto> Destinations { get; set; } = Array.Empty<TripDestinationDto>();
}
