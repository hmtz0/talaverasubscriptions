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
    // Optimistic update
    onMutate: async (newProject) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);

      // Optimistically update to the new value
      if (previousProjects) {
        const optimisticProject: Project = {
          id: Date.now(), // Temporary ID
          name: newProject.name,
          description: newProject.description || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData<Project[]>(['projects'], [...previousProjects, optimisticProject]);
      }

      // Return context with the snapshot
      return { previousProjects };
    },
    // If the mutation fails, roll back to the previous value
    onError: (_err, _newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
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
    // Optimistic update
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);

      // Optimistically update by removing the project
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          ['projects'],
          previousProjects.filter((p) => p.id !== projectId)
        );
      }

      // Return context with the snapshot
      return { previousProjects };
    },
    // If the mutation fails, roll back to the previous value
    onError: (_err, _projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
