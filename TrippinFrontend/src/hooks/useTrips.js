import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';

export function useTrips({ status, sortBy, sortOrder, page = 1, pageSize = 12 } = {}) {
  return useQuery({
    queryKey: ['trips', { status, sortBy, sortOrder, page, pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      params.append('page', page);
      params.append('pageSize', pageSize);
      const { data } = await api.get(`/trips?${params}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicTrips() {
  return useQuery({
    queryKey: ['trips', 'public'],
    queryFn: async () => {
      const { data } = await api.get('/trips/public');
      return data;
    },
  });
}

export function useTrip(id) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripData) => {
      const { data } = await api.post('/trips', tripData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to create trip');
    }
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...tripData }) => {
      const { data } = await api.put(`/trips/${id}`, tripData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.id] });
      toast.success('Trip updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to update trip');
    }
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to delete trip');
    }
  });
}

export function useAddTripDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, destinationId }) => {
      const { data } = await api.post(`/trips/${tripId}/destinations/${destinationId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', variables.tripId] });
      toast.success('Destination added to trip');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to add destination');
    }
  });
}

export function useRemoveTripDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, destinationId }) => {
      await api.delete(`/trips/${tripId}/destinations/${destinationId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', variables.tripId] });
      toast.success('Destination removed from trip');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to remove destination');
    }
  });
}
