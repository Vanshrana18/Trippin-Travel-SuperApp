/**
 * Maps API/search failures to user-facing messages.
 * Backend often returns 200 + [] when RapidAPI quota is exhausted.
 */
export function parseHttpSearchError(err, vertical = 'travel') {
  const status = err?.response?.status;
  const body = err?.response?.data;
  const serverMessage = body?.error || body?.message || body?.title;

  if (status === 429) {
    return {
      type: 'quota',
      message: 'Search is temporarily unavailable — our travel data provider has reached its rate limit. Please try again in a few minutes.',
    };
  }
  if (status === 503 || status === 502) {
    return {
      type: 'provider',
      message: serverMessage || 'Travel search providers are temporarily unavailable. Please try again shortly.',
    };
  }
  if (status === 400) {
    return {
      type: 'validation',
      message: serverMessage || 'Invalid search parameters. Check airport codes (e.g. DEL, JFK) and dates.',
    };
  }
  if (!err?.response) {
    return {
      type: 'network',
      message: 'Could not reach the server. Check your connection and that the API is running.',
    };
  }
  return {
    type: 'unknown',
    message: serverMessage || `${vertical} search failed. Please try again.`,
  };
}

export function getEmptyResultsHint(vertical) {
  const hints = {
    flights: 'Use 3-letter airport codes (DEL, BOM, JFK). If results stay empty, our flight data provider may be out of API quota.',
    hotels: 'Try a major city name (Paris, London). Empty results often mean the hotel search API quota is exhausted.',
    trains: 'Use station codes like NDLS or BCT. Train data depends on a separate provider that may be unavailable.',
    taxis: 'Try well-known pickup locations. Taxi search may be unavailable when API limits are reached.',
  };
  return hints[vertical] || 'Try adjusting your search. Provider API limits can cause empty results even with valid input.';
}
