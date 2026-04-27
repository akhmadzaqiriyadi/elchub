'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/lib/use-debounced-value';
import { useAuth } from '@/features/auth/auth-context';
import {
  createMasterData,
  deleteMasterData,
  getMasterDataByKindWithParams,
  updateMasterData,
} from '../api';
import type { MasterDataKind, MasterDataMutationInput } from '../types';

type FormErrors = {
  name?: string;
  slugOrCode?: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const codePattern = /^[A-Z]+(?:_[A-Z0-9]+)*$/;

export function useManagementMasterData() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [kind, setKind] = useState<MasterDataKind>('types');
  const [name, setName] = useState('');
  const [slugOrCode, setSlugOrCode] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const isStatusKind = kind === 'statuses';

  const rowsQuery = useQuery({
    queryKey: ['management', 'master-data', kind, token, debouncedSearch, page, limit],
    queryFn: () =>
      getMasterDataByKindWithParams(kind, {
        token,
        q: debouncedSearch || undefined,
        page,
        limit,
      }),
    enabled: Boolean(token),
  });

  const resetForm = () => {
    setName('');
    setSlugOrCode('');
    setSortOrder('0');
    setIsActive(true);
    setEditingId('');
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const normalizedSlugOrCode = slugOrCode.trim();

    if (!name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!normalizedSlugOrCode) {
      nextErrors.slugOrCode = isStatusKind ? 'Code is required' : 'Slug is required';
    } else if (!isStatusKind && !slugPattern.test(normalizedSlugOrCode)) {
      nextErrors.slugOrCode = 'Slug must be lowercase kebab-case (example: mentoring-session)';
    } else if (isStatusKind && !codePattern.test(normalizedSlugOrCode)) {
      nextErrors.slugOrCode = 'Code must be UPPERCASE_UNDERSCORE (example: NO_SHOW)';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const payload = useMemo<MasterDataMutationInput>(
    () => ({
      name: name.trim(),
      ...(isStatusKind
        ? { code: slugOrCode.trim().toUpperCase() }
        : { slug: slugOrCode.trim().toLowerCase() }),
      sortOrder: Number(sortOrder),
      isActive,
    }),
    [isStatusKind, name, slugOrCode, sortOrder, isActive],
  );

  const createMutation = useMutation({
    mutationFn: () => createMasterData(kind, payload, token),
    onSuccess: (result) => {
      toast.success(result.message);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['management', 'master-data', kind] });
      queryClient.invalidateQueries({ queryKey: ['management', 'event-master-data'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create master data';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateMasterData(kind, editingId, payload, token),
    onSuccess: (result) => {
      toast.success(result.message);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['management', 'master-data', kind] });
      queryClient.invalidateQueries({ queryKey: ['management', 'event-master-data'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update master data';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMasterData(kind, id, token),
    onSuccess: (result) => {
      toast.success(result.message);
      setDeleteTarget(null);
      setPendingDeleteId('');
      queryClient.invalidateQueries({ queryKey: ['management', 'master-data', kind] });
      queryClient.invalidateQueries({ queryKey: ['management', 'event-master-data'] });
    },
    onError: (error) => {
      setPendingDeleteId('');
      const message = error instanceof Error ? error.message : 'Failed to delete master data';
      toast.error(message);
    },
  });

  const submitForm = () => {
    if (!token) {
      toast.error('Unauthorized');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (editingId) {
      updateMutation.mutate();
      return;
    }

    createMutation.mutate();
  };

  const requestDelete = (id: string, itemName: string) => {
    setDeleteTarget({ id, name: itemName });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setPendingDeleteId(deleteTarget.id);
    deleteMutation.mutate(deleteTarget.id);
  };

  const cancelDelete = () => {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
    setPendingDeleteId('');
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const isRowUpdating = (rowId: string) => updateMutation.isPending && editingId === rowId;
  const isRowDeleting = (rowId: string) => deleteMutation.isPending && pendingDeleteId === rowId;

  const startEdit = (row: {
    id: string;
    name: string;
    slug: string | null;
    code: string | null;
    sortOrder: number;
    isActive: boolean;
  }) => {
    setEditingId(row.id);
    setName(row.name);
    setSlugOrCode((isStatusKind ? row.code : row.slug) ?? '');
    setSortOrder(String(row.sortOrder));
    setIsActive(row.isActive);
    setFormErrors({});
  };

  const pagination = rowsQuery.data?.data.pagination;
  const isSearchDebouncing = searchInput !== debouncedSearch;

  return {
    kind,
    setKind,
    isStatusKind,
    name,
    setName,
    slugOrCode,
    setSlugOrCode,
    sortOrder,
    setSortOrder,
    isActive,
    setIsActive,
    editingId,
    formErrors,
    isSubmitting,
    isRowUpdating,
    isRowDeleting,
    submitForm,
    searchInput,
    setSearchInput,
    page,
    setPage,
    limit,
    setLimit,
    isSearchDebouncing,
    pagination,
    rowsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    startEdit,
    requestDelete,
    deleteTarget,
    confirmDelete,
    cancelDelete,
    resetForm,
  };
}
