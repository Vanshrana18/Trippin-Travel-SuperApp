import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';

export function useDestinationReviews(destinationId, { page = 1, pageSize = 10 } = {}) {
  return useQuery({
    queryKey: ['reviews', 'destination', destinationId, { page, pageSize }],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/destination/${destinationId}?page=${page}&pageSize=${pageSize}`);
      return data;
    },
    enabled: !!destinationId,
    staleTime: 60 * 1000,
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['reviews', 'my'],
    queryFn: async () => {
      const { data } = await api.get('/reviews/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await api.post('/reviews', reviewData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'destination', variables.destinationId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['destinations', variables.destinationId] });
      toast.success('Review posted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to post review');
    }
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      toast.success('Review deleted');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to delete review');
    }
  });
}
