using System.ComponentModel.DataAnnotations;

namespace Trippin.API.DTOs;

public class CreateReviewRequest
{
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    [Required]
    public int DestinationId { get; set; }

    public string[]? Photos { get; set; }
}

public class ReviewDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public IReadOnlyList<string> Photos { get; set; } = Array.Empty<string>();
    public bool IsVerified { get; set; }
    public int HelpfulVotes { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string? AuthorAvatarUrl { get; set; }
    public int DestinationId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MyReviewDto : ReviewDto
{
    public string DestinationName { get; set; } = string.Empty;
}
