using System.ComponentModel.DataAnnotations;

namespace Trippin.API.Helpers;

public static class ValidationHelper
{
    public static bool TryValidate(object instance, out IDictionary<string, string[]> errors)
    {
        var context = new ValidationContext(instance);
        var results = new List<ValidationResult>();
        var ok = Validator.TryValidateObject(instance, context, results, validateAllProperties: true);
        if (ok)
        {
            errors = new Dictionary<string, string[]>();
            return true;
        }

        errors = results
            .Where(r => r.MemberNames.Any())
            .SelectMany(r => r.MemberNames.Select(m => (Member: m, Message: r.ErrorMessage ?? "Invalid")))
            .GroupBy(x => x.Member)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Message).ToArray());
        return false;
    }
}
