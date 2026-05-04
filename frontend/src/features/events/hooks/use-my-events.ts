import { useQuery } from '@tanstack/react-query';
import { getMyEvents, type MyEventsQuery } from '../api';
import { useAuth } from '@/features/auth';

export function useMyEvents(query: MyEventsQuery) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['events', 'my-events', query],
    queryFn: () => getMyEvents(token || '', query),
    enabled: Boolean(isAuthenticated && token),
  });
}
