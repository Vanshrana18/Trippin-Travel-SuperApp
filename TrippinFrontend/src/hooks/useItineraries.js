import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';

export function useItinerary(id) {
  return useQuery({
    queryKey: ['itineraries', id],
    queryFn: async () => {
      const { data } = await api.get(`/itineraries/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useTripItineraries(tripId) {
  return useQuery({
    queryKey: ['itineraries', 'trip', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/itineraries/trip/${tripId}`);
      return data;
    },
    enabled: !!tripId,
    staleTime: 60 * 1000,
  });
}

export function useGenerateItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (generateData) => {
      const { data } = await api.post('/itineraries/generate', generateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', 'trip', variables.tripId] });
      toast.success('Itinerary generated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to generate itinerary');
    }
  });
}

export function useDeleteItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/itineraries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      toast.success('Itinerary deleted');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to delete itinerary');
    }
  });
}
