namespace Trippin.API.Helpers;

public static class ConnectionStringParser
{
    public static (string? Server, string? Database) ParseSqlServer(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return (null, null);

        string? server = null;
        string? database = null;
        foreach (var part in connectionString.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var eq = part.IndexOf('=');
            if (eq <= 0) continue;
            var key = part[..eq].Trim();
            var value = part[(eq + 1)..].Trim();
            if (key.Equals("Server", StringComparison.OrdinalIgnoreCase) ||
                key.Equals("Data Source", StringComparison.OrdinalIgnoreCase))
                server = value;
            else if (key.Equals("Database", StringComparison.OrdinalIgnoreCase) ||
                     key.Equals("Initial Catalog", StringComparison.OrdinalIgnoreCase))
                database = value;
        }

        return (server, database);
    }
}
