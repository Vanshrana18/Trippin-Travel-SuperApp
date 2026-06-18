using System.Net.Http.Json;
using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Trippin.API.Data;
using Trippin.API.DTOs;
using Trippin.API.Helpers;
using Trippin.API.Models;

namespace Trippin.API.Services;

public class OAuthService(AppDbContext db, JwtHelper jwt, IConfiguration config, HttpClient httpClient)
{
    public async Task<AuthResponse?> LoginWithGoogleAsync(string idToken, CancellationToken ct = default)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { config["OAuth:Google:ClientId"] }
            });

            var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject || u.Email == payload.Email, ct);
            if (user == null)
            {
                user = new User
                {
                    Email = payload.Email,
                    Name = payload.Name,
                    AvatarUrl = payload.Picture,
                    GoogleId = payload.Subject,
                    AuthProvider = "Google",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Users.Add(user);
            }
            else
            {
                user.GoogleId = payload.Subject;
                user.AuthProvider = "Google";
                user.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct);
            return CreateAuthResponse(user);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Google OAuth Error]: {ex}");
            throw; // Re-throw so endpoint returns the actual error, not a silent 401
        }
    }

    public async Task<AuthResponse?> LoginWithGitHubAsync(string code, CancellationToken ct = default)
    {
        try
        {
            // Step 1: Exchange code for access token
            var tokenReq = new HttpRequestMessage(HttpMethod.Post, "https://github.com/login/oauth/access_token");
            tokenReq.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            tokenReq.Content = JsonContent.Create(new
            {
                client_id = config["OAuth:GitHub:ClientId"],
                client_secret = config["OAuth:GitHub:ClientSecret"],
                code = code
            });

            var tokenRes = await httpClient.SendAsync(tokenReq, ct);
            tokenRes.EnsureSuccessStatusCode();
            var tokenData = await tokenRes.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
            var accessToken = tokenData.GetProperty("access_token").GetString();

            // Step 2: Get user info from GitHub
            var userReq = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
            userReq.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            userReq.Headers.UserAgent.Add(new System.Net.Http.Headers.ProductInfoHeaderValue("Trippin", "1.0"));
            
            var userRes = await httpClient.SendAsync(userReq, ct);
            userRes.EnsureSuccessStatusCode();
            var userData = await userRes.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);

            var githubId = userData.GetProperty("id").GetInt64().ToString();
            var email = userData.TryGetProperty("email", out var e) && e.ValueKind != JsonValueKind.Null ? e.GetString() : $"{githubId}@github.com";
            var name = userData.TryGetProperty("name", out var n) && n.ValueKind != JsonValueKind.Null ? n.GetString() : userData.GetProperty("login").GetString() ?? "GitHub User";
            var avatar = userData.TryGetProperty("avatar_url", out var av) ? av.GetString() : null;

            var user = await db.Users.FirstOrDefaultAsync(u => u.GitHubId == githubId || u.Email == email, ct);
            if (user == null)
            {
                user = new User
                {
                    Email = email!,
                    Name = name ?? "GitHub User",
                    AvatarUrl = avatar,
                    GitHubId = githubId,
                    AuthProvider = "GitHub",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Users.Add(user);
            }
            else
            {
                user.GitHubId = githubId;
                user.AuthProvider = "GitHub";
                user.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct);
            return CreateAuthResponse(user);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GitHub OAuth Error]: {ex}");
            return null;
        }
    }

    public async Task<AuthResponse?> LoginWithMicrosoftAsync(string idToken, CancellationToken ct = default)
    {
        // For simplicity, we assume the idToken is already validated by the frontend (MSAL)
        // In a real app, you should validate the JWT signature and claims.
        try
        {
            // Placeholder: Parse token without validation for demo, but SHOULD validate
            // Note: Use System.IdentityModel.Tokens.Jwt or similar for proper validation
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(idToken);
            
            var msId = token.Subject;
            var email = token.Claims.FirstOrDefault(c => c.Type == "email" || c.Type == "preferred_username")?.Value;
            var name = token.Claims.FirstOrDefault(c => c.Type == "name")?.Value ?? "Microsoft User";

            var user = await db.Users.FirstOrDefaultAsync(u => u.MicrosoftId == msId || u.Email == email, ct);
            if (user == null)
            {
                user = new User
                {
                    Email = email ?? $"{msId}@microsoft.com",
                    Name = name,
                    MicrosoftId = msId,
                    AuthProvider = "Microsoft",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Users.Add(user);
            }
            else
            {
                user.MicrosoftId = msId;
                user.AuthProvider = "Microsoft";
                user.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct);
            return CreateAuthResponse(user);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Microsoft OAuth Error]: {ex}");
            return null;
        }
    }

    private AuthResponse CreateAuthResponse(User user)
    {
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
