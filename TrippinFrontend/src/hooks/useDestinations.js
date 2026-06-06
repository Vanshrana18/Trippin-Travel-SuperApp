import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

function getCachedData(key) {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : undefined;
  } catch {
    return undefined;
  }
}

function setCachedData(key, data) {
  try {
    if (data) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Failed to save destinations cache', e);
  }
}

export function useDestinations({ search, category, country, sortBy, sortOrder, page = 1, pageSize = 12 } = {}) {
  const cacheKey = `cached_destinations_${search || ''}_${category || ''}_${country || ''}_${sortBy || ''}_${sortOrder || ''}_${page}_${pageSize}`;
  return useQuery({
    queryKey: ['destinations', { search, category, country, sortBy, sortOrder, page, pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (country) params.append('country', country);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      params.append('page', page);
      params.append('pageSize', pageSize);
      const { data } = await api.get(`/destinations?${params}`);
      setCachedData(cacheKey, data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    initialData: () => getCachedData(cacheKey),
  });
}

export function usePopularDestinations(count = 6) {
  const cacheKey = `cached_destinations_popular_${count}`;
  return useQuery({
    queryKey: ['destinations', 'popular', count],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/popular?count=${count}`);
      setCachedData(cacheKey, data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    initialData: () => getCachedData(cacheKey),
  });
}

export function useTrendingDestinations(count = 12) {
  const cacheKey = `cached_destinations_trending_${count}`;
  return useQuery({
    queryKey: ['destinations', 'trending', count],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/trending?count=${count}`);
      setCachedData(cacheKey, data);
      return data;
    },
    staleTime: 10 * 60 * 1000, // refresh every 10 min on client
    refetchOnWindowFocus: false,
    initialData: () => getCachedData(cacheKey),
  });
}

export function useDestination(id) {
  const cacheKey = `cached_destination_${id}`;
  return useQuery({
    queryKey: ['destinations', id],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/${id}`);
      setCachedData(cacheKey, data);
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => getCachedData(cacheKey),
  });
}

export function useRecommendations() {
  const cacheKey = 'cached_destinations_recommendations';
  return useQuery({
    queryKey: ['destinations', 'recommendations'],
    queryFn: async () => {
      const { data } = await api.get('/destinations/recommendations');
      setCachedData(cacheKey, data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    initialData: () => getCachedData(cacheKey),
  });
}
