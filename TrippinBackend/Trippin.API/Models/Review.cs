namespace Trippin.API.Models;

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Photos { get; set; }
    public bool IsVerified { get; set; }
    public int HelpfulVotes { get; set; }
    public bool IsDeleted { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int DestinationId { get; set; }
    public Destination Destination { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
