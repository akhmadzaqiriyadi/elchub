import { useQuery } from '@tanstack/react-query';
import { getEventDetail } from '../api';

export function useEventDetail(slug: string) {
  return useQuery({
    queryKey: ['events', slug],
    queryFn: async () => {
      const response = await getEventDetail(slug);
      return response.data;
    },
    enabled: !!slug,
  });
}
