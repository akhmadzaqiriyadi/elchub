'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/auth-context';
import { deleteManagementEvent } from '../api';
import type { EventListPayload } from '../types';

export function useManagementEventCrud() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState('');

  const requestDelete = (eventId: string, eventTitle: string) => {
    setDeleteTarget({ id: eventId, title: eventTitle });
  };

  const cancelDelete = () => {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
    setPendingDeleteId('');
  };

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => deleteManagementEvent(eventId, token),
    onMutate: async (eventId: string) => {
      await queryClient.cancelQueries({ queryKey: ['management', 'events'] });

      const snapshots = queryClient.getQueriesData<EventListPayload>({
        queryKey: ['management', 'events'],
      });

      queryClient.setQueriesData<EventListPayload>({ queryKey: ['management', 'events'] }, (current) => {
        if (!current) return current;

        const nextItems = current.data.items.filter((item) => item.id !== eventId);

        if (nextItems.length === current.data.items.length) {
          return current;
        }

        const nextTotal = Math.max(0, current.data.pagination.total - 1);

        return {
          ...current,
          data: {
            ...current.data,
            items: nextItems,
            pagination: {
              ...current.data.pagination,
              total: nextTotal,
              totalPages: Math.max(1, Math.ceil(nextTotal / current.data.pagination.limit)),
            },
          },
        };
      });

      return { snapshots };
    },
    onSuccess: (result) => {
      toast.success(result.message || 'Event deleted');
      setDeleteTarget(null);
      setPendingDeleteId('');
      queryClient.invalidateQueries({ queryKey: ['landing', 'event-highlights'] });
    },
    onError: (error, _eventId, context) => {
      context?.snapshots.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value);
      });
      setPendingDeleteId('');
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['landing', 'event-highlights'] });
    },
  });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setPendingDeleteId(deleteTarget.id);
    deleteMutation.mutate(deleteTarget.id);
  };

  return {
    deleteTarget,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isRowDeleting: (eventId: string) => deleteMutation.isPending && pendingDeleteId === eventId,
    isDeleting: deleteMutation.isPending,
  };
}
