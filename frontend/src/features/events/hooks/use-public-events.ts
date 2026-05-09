import { useQuery } from '@tanstack/react-query';
import { getPublicEvents, PublicEventsQuery } from '../api';

export function usePublicEvents(query: PublicEventsQuery = {}) {
  return useQuery({
    queryKey: ['public-events', query],
    queryFn: async () => {
      const response = await getPublicEvents(query);
      return response.data;
    },
  });
}
