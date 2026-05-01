'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/auth-context';
import { getManagementEventById, updateManagementEvent, getEventMasterData } from '../api';
import {
  buildManagementEventPayload,
  initialEventFormState,
  type EventFormErrors,
  type EventFormState,
  validateEventForm,
} from '../validation/event-form';
import type { EventListItem } from '../types';

function toDatetimeLocalValue(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function mapEventToForm(event: EventListItem): EventFormState {
  return {
    title: event.title,
    description: event.description ?? '',
    imageUrl: event.image ?? '',
    meetLink: event.meetLink ?? '',
    typeId: '',
    modeId: '',
    levelId: event.level?.id ?? '',
    statusId: '',
    startAt: toDatetimeLocalValue(event.startAt),
    endAt: toDatetimeLocalValue(event.endAt),
    registrationOpenAt: toDatetimeLocalValue(event.registrationOpenAt),
    registrationCloseAt: toDatetimeLocalValue(event.registrationCloseAt),
    timezone: event.timezone ?? 'Asia/Jakarta',
    capacity: typeof event.capacity === 'number' ? String(event.capacity) : '',
  };
}

export function useManagementEventEdit(eventId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [formState, setFormState] = useState<EventFormState>(initialEventFormState);
  const [formErrors, setFormErrors] = useState<EventFormErrors>({});
  const [formSummaryErrors, setFormSummaryErrors] = useState<string[]>([]);
  const [draftToLoad, setDraftToLoad] = useState<EventFormState | null>(null);

  const setField = <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }));
    if (formErrors[field]) setFormErrors((current) => ({ ...current, [field]: undefined }));
    if (formSummaryErrors.length > 0) setFormSummaryErrors([]);
  };

  const payload = useMemo(() => buildManagementEventPayload(formState), [formState]);

  const masterDataQuery = useQuery({
    queryKey: ['management', 'event-master-data', token],
    queryFn: () => getEventMasterData(token),
    staleTime: 5 * 60_000,
    enabled: Boolean(token),
  });

  const selectedEventQuery = useQuery({
    queryKey: ['management', 'events', 'detail', eventId, token],
    queryFn: () => getManagementEventById(eventId, token),
    enabled: Boolean(token && eventId),
  });

  const masterData = masterDataQuery.data?.data;

  const hydrationState = useMemo(() => {
    if (!selectedEventQuery.data?.data) return null;

    const event = selectedEventQuery.data.data;
    const nextState = mapEventToForm(event);

    const foundType = masterData?.types.find((row) => row.slug === event.type.slug);
    const foundMode = masterData?.modes.find((row) => row.slug === event.mode.slug);
    const foundStatus = masterData?.eventStatuses.find((row) => row.code === event.status.code);

    return {
      ...nextState,
      typeId: foundType?.id ?? '',
      modeId: foundMode?.id ?? '',
      statusId: foundStatus?.id ?? '',
    };
  }, [selectedEventQuery.data, masterData]);

  useEffect(() => {
    if (!hydrationState) return;

    const draftKey = `draft_event_edit_${eventId}`;
    const draft = localStorage.getItem(draftKey);
    let shouldLoadDraft = false;

    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === 'object') {
          if (JSON.stringify(parsed) !== JSON.stringify(hydrationState)) {
             setDraftToLoad(parsed);
             shouldLoadDraft = true;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (!shouldLoadDraft) {
      setFormState(hydrationState);
    }
  }, [hydrationState, eventId]);

  useEffect(() => {
    if (!hydrationState || !eventId) return;

    const draftKey = `draft_event_edit_${eventId}`;
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(formState) !== JSON.stringify(hydrationState)) {
        localStorage.setItem(draftKey, JSON.stringify(formState));
      } else {
        localStorage.removeItem(draftKey);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formState, hydrationState, eventId]);

  const isDirty = useMemo(() => {
    if (!hydrationState) return false;
    return JSON.stringify(formState) !== JSON.stringify(hydrationState);
  }, [formState, hydrationState]);

  useEffect(() => {
    if (!isDirty) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const confirmLoadDraft = () => {
    if (draftToLoad) {
      setFormState(draftToLoad);
      setDraftToLoad(null);
    }
  };

  const cancelLoadDraft = () => {
    if (hydrationState) setFormState(hydrationState);
    setDraftToLoad(null);
  };

  const updateMutation = useMutation({
    mutationFn: () => updateManagementEvent(eventId, payload, token),
    onSuccess: () => {
      toast.success('Event updated');
      localStorage.removeItem(`draft_event_edit_${eventId}`);
      queryClient.invalidateQueries({ queryKey: ['management', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['landing', 'event-highlights'] });
      queryClient.invalidateQueries({ queryKey: ['management', 'events', 'detail', eventId] });
      router.push('/management/events');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
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

    updateMutation.mutate();
  };

  return {
    formState,
    formErrors,
    formSummaryErrors,
    setField,
    submit,
    isSubmitting: updateMutation.isPending,
    masterData,
    isLoading: masterDataQuery.isLoading || selectedEventQuery.isLoading,
    draftToLoad,
    confirmLoadDraft,
    cancelLoadDraft,
  };
}
