'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/auth-context';
import { createManagementEvent, getEventMasterData } from '../api';
import {
  buildManagementEventPayload,
  initialEventFormState,
  type EventFormErrors,
  type EventFormState,
  validateEventForm,
} from '../validation/event-form';

export function useManagementEventCreate() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [formState, setFormState] = useState<EventFormState>(initialEventFormState);
  const [formErrors, setFormErrors] = useState<EventFormErrors>({});
  const [formSummaryErrors, setFormSummaryErrors] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem('draft_event_create');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === 'object') {
          setFormState(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(formState) !== JSON.stringify(initialEventFormState)) {
        localStorage.setItem('draft_event_create', JSON.stringify(formState));
      } else {
        localStorage.removeItem('draft_event_create');
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [formState, isReady]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(initialEventFormState);
  }, [formState]);

  useEffect(() => {
    if (!isDirty) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const setField = <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }

    if (formSummaryErrors.length > 0) {
      setFormSummaryErrors([]);
    }
  };

  const payload = useMemo(() => buildManagementEventPayload(formState), [formState]);

  const masterDataQuery = useQuery({
    queryKey: ['management', 'event-master-data', token],
    queryFn: () => getEventMasterData(token),
    staleTime: 5 * 60_000,
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: () => createManagementEvent(payload, token),
    onSuccess: () => {
      toast.success('Event created');
      localStorage.removeItem('draft_event_create');
      queryClient.invalidateQueries({ queryKey: ['management', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['landing', 'event-highlights'] });
      router.push('/management/events');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    },
  });

  const submit = () => {
    const validation = validateEventForm(formState, masterDataQuery.data?.data.modes);
    setFormErrors(validation.fieldErrors);
    setFormSummaryErrors(validation.summaryErrors);

    if (!validation.isValid) return;

    if (!token) {
      toast.error('Unauthorized');
      return;
    }

    createMutation.mutate();
  };

  return {
    formState,
    formErrors,
    formSummaryErrors,
    setField,
    submit,
    isSubmitting: createMutation.isPending,
    masterData: masterDataQuery.data?.data,
    isMasterDataLoading: masterDataQuery.isLoading,
  };
}
