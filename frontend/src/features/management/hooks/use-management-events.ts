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
  const [sortBy, setSortBy] = useState<'createdAt' | 'startAt' | 'endAt' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const limit = 10;

  // Convert Date objects to ISO strings for API
  const startDateISO = dateRange.from ? dateRange.from.toISOString() : undefined;
  const endDateISO = dateRange.to ? dateRange.to.toISOString() : undefined;

  const queryParams = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      typeSlug: typeSlug || undefined,
      modeSlug: modeSlug || undefined,
      statusCode: statusCode || undefined,
      sortBy,
      sortOrder,
      startDate: startDateISO,
      endDate: endDateISO,
      page,
      limit,
      token,
    }),
    [debouncedSearch, typeSlug, modeSlug, statusCode, sortBy, sortOrder, startDateISO, endDateISO, page, token],
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
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    dateRange,
    setDateRange,
    page,
    setPage,
    eventsQuery,
    masterDataQuery,
  };
}
