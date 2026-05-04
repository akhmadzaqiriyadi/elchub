import { useQuery } from '@tanstack/react-query';
import { getMyEvents } from '../api';
import { useAuth } from '@/features/auth';

export function useMyEvents() {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['events', 'my-events'],
    queryFn: () => getMyEvents(token || ''),
    enabled: Boolean(isAuthenticated && token),
  });
}
