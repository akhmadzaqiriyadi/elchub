import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventSyllabus, completeMaterial, uncompleteMaterial } from '../api';

export function useEventSyllabus(eventId: string, token?: string) {
  return useQuery({
    queryKey: ['events', eventId, 'syllabus', token],
    queryFn: async () => {
      const response = await getEventSyllabus(eventId, token);
      return response.data;
    },
    enabled: !!eventId,
  });
}

export function useMaterialProgress(token: string) {
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (materialId: string) => completeMaterial(materialId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: (materialId: string) => uncompleteMaterial(materialId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    complete: completeMutation.mutateAsync,
    uncomplete: uncompleteMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    isUncompleting: uncompleteMutation.isPending,
  };
}
