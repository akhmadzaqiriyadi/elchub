import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, UpdateProfileInput } from '../api';
import { useAuth } from '@/features/auth';

export function useUpdateProfile() {
  const { token, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input, token || ''),
    onSuccess: (response) => {
      // Refresh the user in auth context to update UI globally
      refreshUser();
      // Also invalidate relevant queries if any
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
