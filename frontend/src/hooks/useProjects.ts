import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import type { Project, CreateProjectInput } from '../types';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>('/projects');
      return response.data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const response = await apiClient.post<Project>('/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: number) => {
      await apiClient.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
