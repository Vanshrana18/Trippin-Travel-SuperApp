using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Helpers;
using Trippin.API.Models;

namespace Trippin.API.Services;

public class AuthService(AppDbContext db, JwtHelper jwt)
{
    const int BcryptWorkFactor = 12;

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest req, CancellationToken ct = default)
    {
        var exists = await db.Users.AsNoTracking().AnyAsync(u => u.Email == req.Email, ct);
        if (exists) return null;

        var user = new User
        {
            Name = req.Name,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password, BcryptWorkFactor),
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        return new AuthResponse
        {
            Token = jwt.GenerateToken(user),
            User = new UserSummaryDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                AvatarUrl = user.AvatarUrl
            }
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest req, CancellationToken ct = default)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == req.Email, ct);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        return new AuthResponse
        {
            Token = jwt.GenerateToken(user),
            User = new UserSummaryDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                AvatarUrl = user.AvatarUrl
            }
        };
    }
}
