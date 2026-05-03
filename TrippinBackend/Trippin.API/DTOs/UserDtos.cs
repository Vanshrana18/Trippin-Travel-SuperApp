using System.ComponentModel.DataAnnotations;

namespace Trippin.API.DTOs;

public class UserSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

public class UserProfileDto : UserSummaryDto
{
    public string? Bio { get; set; }
    public string? Country { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateProfileRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(2000)]
    public string? Bio { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [Url, MaxLength(2000)]
    public string? AvatarUrl { get; set; }
}

public class DashboardStatsDto
{
    public int TripCount { get; set; }
    public int ActiveTrips { get; set; }
    public int BookingCount { get; set; }
    public decimal TotalSpend { get; set; }
    public int DestinationsVisited { get; set; }
    public int ReviewCount { get; set; }
}
