import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventAssignments, getEventAssignment, submitAssignment } from '../api';
import type { AssignmentSubmissionInput } from '../api';

export function useEventAssignments(eventId: string, token?: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['events', eventId, 'assignments', token, page, limit],
    queryFn: async () => {
      const response = await getEventAssignments(eventId, token, { page, limit });
      return {
        items: response.data.items,
        pagination: response.data.pagination,
      };
    },
    enabled: !!eventId,
  });
}

export function useEventAssignment(eventId: string, assignmentId: string, token?: string) {
  return useQuery({
    queryKey: ['events', eventId, 'assignments', assignmentId, token],
    queryFn: async () => {
      const response = await getEventAssignment(eventId, assignmentId, token);
      return response.data;
    },
    enabled: !!eventId && !!assignmentId,
  });
}

export function useSubmitAssignment(eventId: string, token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, input }: { assignmentId: string; input: AssignmentSubmissionInput }) =>
      submitAssignment(assignmentId, input, token),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'assignments', variables.assignmentId] });
    },
  });
}
