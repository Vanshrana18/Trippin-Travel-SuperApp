import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export function useDestinations({ search, category, country, sortBy, sortOrder, page = 1, pageSize = 12 } = {}) {
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
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularDestinations(count = 6) {
  return useQuery({
    queryKey: ['destinations', 'popular', count],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/popular?count=${count}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDestination(id) {
  return useQuery({
    queryKey: ['destinations', id],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['destinations', 'recommendations'],
    queryFn: async () => {
      const { data } = await api.get('/destinations/recommendations');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
