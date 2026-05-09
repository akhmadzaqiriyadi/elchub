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
  UserListParams,
  UserListPayload,
  UserDetailPayload,
  CreateUserInput,
  UpdateUserInput,
  UserMutationPayload,
  ManagementRegistrationListParams,
  ManagementRegistrationListPayload,
  ManagementRegistrationUpdateInput,
  ManagementRegistrationMutationPayload,
  SectionMutationInput,
  MaterialMutationInput,
} from './types';

function toQueryString(params: EventListParams) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.typeSlug) searchParams.set('typeSlug', params.typeSlug);
  if (params.modeSlug) searchParams.set('modeSlug', params.modeSlug);
  if (params.statusCode) searchParams.set('statusCode', params.statusCode);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

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

type EventBannerUploadPayload = {
  success: true;
  data: {
    imageUrl: string;
  };
};

export function uploadManagementEventBanner(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<EventBannerUploadPayload>('/management/uploads/event-banner', {
    method: 'POST',
    body: formData,
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

// ============================================================================
// Users Management API
// ============================================================================

function toUserListQueryString(params: UserListParams) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.role) searchParams.set('role', params.role);
  if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const built = searchParams.toString();
  return built ? `?${built}` : '';
}

export function getManagementUsers(params: UserListParams) {
  return apiRequest<UserListPayload>(`/management/users${toUserListQueryString(params)}`, {
    method: 'GET',
    token: params.token,
  });
}

export function getManagementUserById(userId: string, token: string) {
  return apiRequest<UserDetailPayload>(`/management/users/${userId}`, {
    method: 'GET',
    token,
  });
}

export function createManagementUser(input: CreateUserInput, token: string) {
  return apiRequest<UserMutationPayload>('/management/users', {
    method: 'POST',
    body: input,
    token,
  });
}

export function updateManagementUser(userId: string, input: UpdateUserInput, token: string) {
  return apiRequest<UserMutationPayload>(`/management/users/${userId}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}

export function deleteManagementUser(userId: string, token: string) {
  return apiRequest<UserMutationPayload>(`/management/users/${userId}`, {
    method: 'DELETE',
    token,
  });
}

// ============================================================================
// Event Registrations API
// ============================================================================

function toRegistrationListQueryString(params: ManagementRegistrationListParams) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const built = searchParams.toString();
  return built ? `?${built}` : '';
}

export function getManagementEventRegistrations(eventId: string, params: ManagementRegistrationListParams) {
  return apiRequest<ManagementRegistrationListPayload>(`/management/events/${eventId}/registrations${toRegistrationListQueryString(params)}`, {
    method: 'GET',
    token: params.token,
  });
}

export function updateManagementEventRegistration(eventId: string, registrationId: string, input: ManagementRegistrationUpdateInput, token: string) {
  return apiRequest<ManagementRegistrationMutationPayload>(`/management/events/${eventId}/registrations/${registrationId}`, {
    method: 'PATCH',
    body: input,
    token,
  });
}

// ============================================================================
// LMS Management API
// ============================================================================

export function createManagementSection(eventId: string, input: SectionMutationInput, token: string) {
  return apiRequest<any>(`/management/events/${eventId}/sections`, {
    method: 'POST',
    body: input,
    token,
  });
}

export function createManagementMaterial(eventId: string, sectionId: string, input: MaterialMutationInput, token: string) {
  return apiRequest<any>(`/management/events/${eventId}/sections/${sectionId}/materials`, {
    method: 'POST',
    body: input,
    token,
  });
}

export function reorderManagementSections(eventId: string, ids: string[], token: string) {
  return apiRequest<any>(`/management/events/${eventId}/sections/reorder`, {
    method: 'PUT',
    body: { ids },
    token,
  });
}

export function reorderManagementMaterials(eventId: string, sectionId: string, ids: string[], token: string) {
  return apiRequest<any>(`/management/events/${eventId}/sections/${sectionId}/materials/reorder`, {
    method: 'PUT',
    body: { ids },
    token,
  });
}
export function updateManagementSection(eventId: string, sectionId: string, input: SectionMutationInput, token: string) {
  return apiRequest<any>(`/management/events/${eventId}/sections/${sectionId}`, {
    method: 'PUT',
    body: input,
    token,
  });
}

export function deleteManagementSection(eventId: string, sectionId: string, token: string) {
  return apiRequest<any>(`/management/events/${eventId}/sections/${sectionId}`, {
    method: 'DELETE',
    token,
  });
}

export function updateManagementMaterial(eventId: string, materialId: string, input: MaterialMutationInput, token: string) {
  return apiRequest<any>(`/management/events/${eventId}/materials/${materialId}`, {
    method: 'PUT',
    body: input,
    token,
  });
}

export function deleteManagementMaterial(eventId: string, materialId: string, token: string) {
  return apiRequest<any>(`/management/events/${eventId}/materials/${materialId}`, {
    method: 'DELETE',
    token,
  });
}

export function uploadManagementEventMaterial(file: File, token: string) {

  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<{ success: true; data: { fileUrl: string } }>('/management/uploads/event-material', {
    method: 'POST',
    body: formData,
    token,
  });
}
