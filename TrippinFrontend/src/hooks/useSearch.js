import { useState, useCallback } from 'react';
import api from '../api/axios';

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({ flights: [], hotels: [], trains: [], taxis: [] });

  const searchFlights = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/search/flights', { params: { ...params, currency: params.currency || 'USD' } });
      setResults(prev => ({ ...prev, flights: response.data }));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Flight search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchHotels = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/search/hotels', { params: { ...params, currency: params.currency || 'USD' } });
      setResults(prev => ({ ...prev, hotels: response.data }));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Hotel search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTrains = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/search/trains', { params: { ...params, currency: params.currency || 'USD' } });
      setResults(prev => ({ ...prev, trains: response.data }));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Train search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTaxis = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/search/taxis', { params: { ...params, currency: params.currency || 'USD' } });
      setResults(prev => ({ ...prev, taxis: response.data }));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Taxi search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    results,
    searchFlights,
    searchHotels,
    searchTrains,
    searchTaxis
  };
}
