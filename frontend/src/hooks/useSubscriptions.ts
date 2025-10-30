import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import type { Plan, Subscription } from '../types';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await apiClient.get<Plan[]>('/plans');
      return response.data;
    },
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Subscription>('/subscriptions/current');
        return response.data;
      } catch (error: any) {
        // If no subscription found (404), return null - user is on Free plan
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiClient.post<Subscription>('/subscriptions', { planId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/subscriptions/current');
    },
    onSuccess: () => {
      // Clear the subscription cache completely and set to undefined
      queryClient.setQueryData(['subscription', 'current'], undefined);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
