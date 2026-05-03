using System.ComponentModel.DataAnnotations;

namespace Trippin.API.DTOs;

public class DestinationListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal AverageCostPerDay { get; set; }
    public string Currency { get; set; } = "USD";
    public bool IsPopular { get; set; }
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class DestinationDetailDto : DestinationListDto
{
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Tags { get; set; }
    public IReadOnlyList<string> Highlights { get; set; } = Array.Empty<string>();
    public string BestTimeToVisit { get; set; } = string.Empty;
    public IReadOnlyList<DestinationListDto> RelatedDestinations { get; set; } = Array.Empty<DestinationListDto>();
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
