'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getManagementUsers } from '../api';
import { useAuth } from '@/features/auth';
import type { UserRole } from '../types';

export function useManagementUsers() {
  const { token: accessToken } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const usersQuery = useQuery({
    queryKey: ['management-users', searchInput, selectedRole, selectedStatus, page, limit],
    queryFn: () =>
      getManagementUsers({
        token: accessToken,
        q: searchInput,
        role: selectedRole,
        isActive: selectedStatus,
        page,
        limit,
      }),
    enabled: !!accessToken,
  });

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setSelectedRole(undefined);
    setSelectedStatus(undefined);
    setPage(1);
  }, []);

  return {
    searchInput,
    setSearchInput,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    page,
    setPage,
    limit,
    setLimit,
    usersQuery,
    handleResetFilters,
  };
}
