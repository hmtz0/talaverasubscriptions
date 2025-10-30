import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api';
import type { AuthResponse, LoginInput, SignupInput } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useLogin() {
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.post<AuthResponse>('/auth/signin', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}

export function useSignup() {
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: async (data: SignupInput) => {
      const response = await apiClient.post<AuthResponse>('/auth/signup', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
}
