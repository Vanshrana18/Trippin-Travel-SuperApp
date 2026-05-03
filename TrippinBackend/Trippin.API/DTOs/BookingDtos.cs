using System.ComponentModel.DataAnnotations;

namespace Trippin.API.DTOs;

public class CreateBookingRequest
{
    [Required]
    [RegularExpression("Flight|Hotel|Tour|Activity|Car|Other")]
    public string Type { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Provider { get; set; }
    public string? ConfirmationNumber { get; set; }

    [Range(0, double.MaxValue)]
    public decimal TotalPrice { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "USD";

    [Required]
    public DateTime BookingDate { get; set; }

    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }
    public string? Notes { get; set; }

    [Url, MaxLength(2000)]
    public string? DocumentUrl { get; set; }

    [Required]
    public int TripId { get; set; }
}

public class UpdateBookingStatusRequest
{
    [Required]
    [RegularExpression("Pending|Confirmed|Cancelled|Completed")]
    public string Status { get; set; } = string.Empty;
}

public class BookingDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Provider { get; set; }
    public string? ConfirmationNumber { get; set; }
    public decimal TotalPrice { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime BookingDate { get; set; }
    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? DocumentUrl { get; set; }
    public int TripId { get; set; }
    public string? TripTitle { get; set; }
    public DateTime CreatedAt { get; set; }
}
