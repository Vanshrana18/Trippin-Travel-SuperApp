import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';

export function useBookings({ page = 1, pageSize = 20 } = {}) {
  return useQuery({
    queryKey: ['bookings', { page, pageSize }],
    queryFn: async () => {
      const { data } = await api.get(`/bookings?page=${page}&pageSize=${pageSize}`);
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useBooking(id) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useTripBookings(tripId) {
  return useQuery({
    queryKey: ['bookings', 'trip', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/trip/${tripId}`);
      return data;
    },
    enabled: !!tripId,
    staleTime: 60 * 1000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData) => {
      const { data } = await api.post('/bookings', bookingData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to create booking');
    }
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.patch(`/bookings/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking status updated');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to update booking status');
    }
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to cancel booking');
    }
  });
}
