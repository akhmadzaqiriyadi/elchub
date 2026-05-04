import { useQuery } from '@tanstack/react-query';
import { getEventDetail } from '../api';

export function useEventDetail(slug: string, token?: string) {
  return useQuery({
    queryKey: ['events', slug, token],
    queryFn: async () => {
      const response = await getEventDetail(slug, token);
      return response.data;
    },
    enabled: !!slug,
  });
}
