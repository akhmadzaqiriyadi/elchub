import { useMutation } from '@tanstack/react-query';
import { changePassword, ChangePasswordInput } from '../api';
import { useAuth } from '@/features/auth';

export function useChangePassword() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input, token || ''),
  });
}
