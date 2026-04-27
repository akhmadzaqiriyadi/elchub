'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/lib/use-debounced-value';
import { useAuth } from '@/features/auth/auth-context';
import { getEventMasterData, getManagementEvents } from '../api';

export function useManagementEvents() {
  const { token } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [typeSlug, setTypeSlug] = useState('');
  const [modeSlug, setModeSlug] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const limit = 10;

  const queryParams = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      typeSlug: typeSlug || undefined,
      modeSlug: modeSlug || undefined,
      statusCode: statusCode || undefined,
      page,
      limit,
      token,
    }),
    [debouncedSearch, typeSlug, modeSlug, statusCode, page, token],
  );

  const eventsQuery = useQuery({
    queryKey: ['management', 'events', queryParams],
    queryFn: () => getManagementEvents(queryParams),
    enabled: Boolean(token),
  });

  const masterDataQuery = useQuery({
    queryKey: ['management', 'event-master-data', token],
    queryFn: () => getEventMasterData(token),
    staleTime: 5 * 60_000,
    enabled: Boolean(token),
  });

  return {
    searchInput,
    setSearchInput,
    typeSlug,
    setTypeSlug,
    modeSlug,
    setModeSlug,
    statusCode,
    setStatusCode,
    page,
    setPage,
    eventsQuery,
    masterDataQuery,
  };
}
