import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadProfilePhoto } from '../api';
import { useAuth } from '@/features/auth';

export function useUploadProfilePhoto() {
  const { token, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file, token || ''),
    onSuccess: (response) => {
      // Refresh the user in auth context to update UI globally (especially avatar)
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
