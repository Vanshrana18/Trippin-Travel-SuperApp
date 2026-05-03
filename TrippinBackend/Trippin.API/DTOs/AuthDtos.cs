using System.ComponentModel.DataAnnotations;

namespace Trippin.API.DTOs;

public class RegisterRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserSummaryDto User { get; set; } = null!;
}

public class GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}

public class GitHubLoginRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;
}

public class MicrosoftLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
