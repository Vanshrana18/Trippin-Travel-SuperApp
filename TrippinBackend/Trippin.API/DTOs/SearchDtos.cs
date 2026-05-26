namespace Trippin.API.DTOs;

public class FlightSearchResult
{
    public string Airline { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public string Duration { get; set; } = string.Empty;
    public int Stops { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string BookingUrl { get; set; } = string.Empty;
    public bool IsDemo { get; set; } = false;
}

public class HotelSearchResult
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public decimal PricePerNight { get; set; }
    public string Currency { get; set; } = "USD";
    public string? ImageUrl { get; set; }
    public double? Rating { get; set; }
    public string BookingUrl { get; set; } = string.Empty;
    public bool IsDemo { get; set; } = false;
}

public class TrainSearchResult
{
    public string TrainName { get; set; } = string.Empty;
    public string TrainNumber { get; set; } = string.Empty;
    public string DepartureStation { get; set; } = string.Empty;
    public string ArrivalStation { get; set; } = string.Empty;
    public string DepartureTime { get; set; } = string.Empty;
    public string ArrivalTime { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "INR";
    public bool IsDemo { get; set; } = false;
}

public class TaxiSearchResult
{
    public string Company { get; set; } = string.Empty;
    public string CarType { get; set; } = string.Empty;
    public string EstimatedTime { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsDemo { get; set; } = false;
}
