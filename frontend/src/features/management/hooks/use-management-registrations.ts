import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getManagementEventRegistrations, updateManagementEventRegistration } from '../api';
import type { ManagementRegistrationListParams, ManagementRegistrationUpdateInput } from '../types';

export function useManagementEventRegistrations(eventId: string, params: ManagementRegistrationListParams) {
  return useQuery({
    queryKey: ['management', 'events', 'detail', eventId, 'registrations', params],
    queryFn: () => getManagementEventRegistrations(eventId, params),
    enabled: Boolean(params.token && eventId),
  });
}

export function useUpdateRegistration(eventId: string, token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registrationId, input }: { registrationId: string; input: ManagementRegistrationUpdateInput }) =>
      updateManagementEventRegistration(eventId, registrationId, input, token),
    onSuccess: () => {
      toast.success('Registration status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['management', 'events', 'detail', eventId, 'registrations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update registration status');
    },
  });
}
