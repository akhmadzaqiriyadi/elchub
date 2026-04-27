import { apiRequest } from '@/lib/api-client';

import type {
  EventListParams,
  EventListPayload,
  EventMasterDataPayload,
  ManagementEventDetailPayload,
  ManagementEventMutationInput,
  ManagementEventMutationPayload,
  MasterDataKind,
  MasterDataListPayload,
  MasterDataListParams,
  MasterDataMutationInput,
  MasterDataMutationPayload,
} from './types';

function toQueryString(params: EventListParams) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.typeSlug) searchParams.set('typeSlug', params.typeSlug);
  if (params.modeSlug) searchParams.set('modeSlug', params.modeSlug);
  if (params.statusCode) searchParams.set('statusCode', params.statusCode);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const built = searchParams.toString();
  return built ? `?${built}` : '';
}

export function getManagementEvents(params: EventListParams) {
  return apiRequest<EventListPayload>(`/management/events${toQueryString(params)}`, {
    method: 'GET',
    token: params.token,
  });
}

export function getEventMasterData(token: string) {
  return apiRequest<EventMasterDataPayload>('/management/event-master-data', {
    method: 'GET',
    token,
  });
}

export function getManagementEventById(eventId: string, token: string) {
  return apiRequest<ManagementEventDetailPayload>(`/management/events/${eventId}`, {
    method: 'GET',
    token,
  });
}

export function createManagementEvent(input: ManagementEventMutationInput, token: string) {
  return apiRequest<ManagementEventDetailPayload>('/management/events', {
    method: 'POST',
    body: input,
    token,
  });
}

export function updateManagementEvent(eventId: string, input: ManagementEventMutationInput, token: string) {
  return apiRequest<ManagementEventDetailPayload>(`/management/events/${eventId}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}

export function deleteManagementEvent(eventId: string, token: string) {
  return apiRequest<ManagementEventMutationPayload>(`/management/events/${eventId}`, {
    method: 'DELETE',
    token,
  });
}

export function getMasterDataByKind(kind: MasterDataKind, token: string) {
  return apiRequest<MasterDataListPayload>(`/management/master-data/${kind}`, {
    method: 'GET',
    token,
  });
}

export function getMasterDataByKindWithParams(kind: MasterDataKind, params: MasterDataListParams) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const suffix = query ? `?${query}` : '';

  return apiRequest<MasterDataListPayload>(`/management/master-data/${kind}${suffix}`, {
    method: 'GET',
    token: params.token,
  });
}

export function createMasterData(kind: MasterDataKind, input: MasterDataMutationInput, token: string) {
  return apiRequest<MasterDataMutationPayload>(`/management/master-data/${kind}`, {
    method: 'POST',
    body: input,
    token,
  });
}

export function updateMasterData(kind: MasterDataKind, id: string, input: MasterDataMutationInput, token: string) {
  return apiRequest<MasterDataMutationPayload>(`/management/master-data/${kind}/${id}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}

export function deleteMasterData(kind: MasterDataKind, id: string, token: string) {
  return apiRequest<MasterDataMutationPayload>(`/management/master-data/${kind}/${id}`, {
    method: 'DELETE',
    token,
  });
}
