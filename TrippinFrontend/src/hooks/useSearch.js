import { useState, useCallback, useRef } from 'react';
import api from '../api/axios';
import { parseHttpSearchError, getEmptyResultsHint } from '../utils/searchErrors';

const VERTICALS = {
  flights: 'flights',
  hotels: 'hotels',
  trains: 'trains',
  taxis: 'taxis',
};

async function fetchSearch(endpoint, params) {
  const { data } = await api.get(endpoint, {
    params: { ...params, currency: params.currency || 'USD' },
  });
  return Array.isArray(data) ? data : [];
}

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [results, setResults] = useState({ flights: [], hotels: [], trains: [], taxis: [] });
  const lastRetryRef = useRef(null);

  const runSearch = useCallback(async (vertical, endpoint, params) => {
    setLoading(true);
    setError(null);
    setWarning(null);

    const retry = () => runSearch(vertical, endpoint, params);
    lastRetryRef.current = retry;

    try {
      const data = await fetchSearch(endpoint, params);
      setResults((prev) => ({ ...prev, [vertical]: data }));

      if (data.some(item => item.isDemo)) {
        setWarning({
          type: 'demo',
          message: ' Demo Mode Active — Live Booking API limit reached. Showing hyper-realistic, dynamic mock travel results.',
        });
      } else if (data.length === 0) {
        setWarning({
          type: 'empty',
          message: getEmptyResultsHint(vertical),
        });
      }

      return data;
    } catch (err) {
      const parsed = parseHttpSearchError(err, VERTICALS[vertical]);
      setError(parsed.message);
      setResults((prev) => ({ ...prev, [vertical]: [] }));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFlights = useCallback(
    (params) => runSearch('flights', '/search/flights', params),
    [runSearch]
  );

  const searchHotels = useCallback(
    (params) => runSearch('hotels', '/search/hotels', params),
    [runSearch]
  );

  const searchTrains = useCallback(
    (params) => runSearch('trains', '/search/trains', params),
    [runSearch]
  );

  const searchTaxis = useCallback(
    (params) => runSearch('taxis', '/search/taxis', params),
    [runSearch]
  );

  const retryLastSearch = useCallback(() => {
    if (lastRetryRef.current) lastRetryRef.current();
  }, []);

  const clearStatus = useCallback(() => {
    setError(null);
    setWarning(null);
  }, []);

  return {
    loading,
    error,
    warning,
    results,
    searchFlights,
    searchHotels,
    searchTrains,
    searchTaxis,
    retryLastSearch,
    clearStatus,
  };
}
