import { apiRequest } from '@/lib/api-client';

export type RegisterEventInput = {
  customAnswers?: Record<string, any> | null;
  paymentProofUrl?: string | null;
};

export type RegisterEventPayload = {
  success: boolean;
  message: string;
  data: {
    id: string;
    eventId: string;
    userId: string;
    statusId: string;
    paymentStatus: string;
    paymentProofUrl: string | null;
    createdAt: string;
  };
};

export function registerEvent(eventId: string, input: RegisterEventInput, token: string) {
  return apiRequest<RegisterEventPayload>(`/events/${eventId}/register`, {
    method: 'POST',
    body: input,
    token,
  });
}

export type PaymentProofUploadPayload = {
  success: true;
  data: {
    imageUrl: string;
  };
};

export function uploadPaymentProof(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<PaymentProofUploadPayload>('/uploads/payment-proof', {
    method: 'POST',
    body: formData,
    token,
  });
}

export type EventDetailPayload = {
  success: boolean;
  data: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    meetLink: string | null;
    startAt: string | null;
    endAt: string | null;
    registrationOpenAt: string | null;
    registrationCloseAt: string | null;
    timezone: string | null;
    capacity: number | null;
    attendees: number;
    isFree: boolean;
    price: number | null;
    formSchema: any | null;
    type: { name: string; slug: string };
    mode: { name: string; slug: string };
    level: { id: string; name: string; slug: string } | null;
    status: { code: string; name: string };
    organizer: { id: string; name: string | null; email: string };
    createdAt: string;
    updatedAt: string;
    isRegistered?: boolean;
  };
};

export function getEventDetail(slug: string, token?: string) {
  return apiRequest<EventDetailPayload>(`/events/${slug}`, {
    method: 'GET',
    ...(token ? { token } : {}),
  });
}

// ============================================================================
// My Events API
// ============================================================================

export type MyEventItem = {
  registrationId: string;
  status: string;
  statusCode: string;
  paymentStatus: string;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    startAt: string | null;
    endAt: string | null;
    isFree: boolean;
    price: number | null;
    meetLink: string | null;
    mode: { name: string; slug: string };
    type: { name: string; slug: string };
  };
};

export type MyEventsQuery = {
  q?: string;
  statusCode?: string;
  paymentStatus?: string;
  typeSlug?: string;
  modeSlug?: string;
  page?: number;
  limit?: number;
};

export type MyEventsPayload = {
  success: boolean;
  data: {
    items: MyEventItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export function getMyEvents(token: string, query: MyEventsQuery = {}) {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.statusCode) params.set('statusCode', query.statusCode);
  if (query.paymentStatus) params.set('paymentStatus', query.paymentStatus);
  if (query.typeSlug) params.set('typeSlug', query.typeSlug);
  if (query.modeSlug) params.set('modeSlug', query.modeSlug);
  if (typeof query.page === 'number') params.set('page', String(query.page));
  if (typeof query.limit === 'number') params.set('limit', String(query.limit));

  const path = params.size > 0 ? `/events/my-events?${params.toString()}` : '/events/my-events';

  return apiRequest<MyEventsPayload>(path, {
    method: 'GET',
    token,
  });
}

// ============================================================================
// Public Events List API
// ============================================================================

export type PublicEventsQuery = {
  q?: string;
  page?: number;
  limit?: number;
  typeSlug?: string;
  modeSlug?: string;
  levelSlug?: string;
  statusCode?: string;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
};

export function getPublicEvents(query: PublicEventsQuery = {}) {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.typeSlug) params.set('typeSlug', query.typeSlug);
  if (query.modeSlug) params.set('modeSlug', query.modeSlug);
  if (query.levelSlug) params.set('levelSlug', query.levelSlug);
  if (query.statusCode) params.set('statusCode', query.statusCode);
  if (query.isFree !== undefined) params.set('isFree', String(query.isFree));
  if (query.minPrice !== undefined) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (typeof query.page === 'number') params.set('page', String(query.page));
  if (typeof query.limit === 'number') params.set('limit', String(query.limit));

  const path = params.size > 0 ? `/events?${params.toString()}` : '/events';

  return apiRequest<any>(path, {
    method: 'GET',
  });
}

// ============================================================================
// LMS Public & Learning API
// ============================================================================

export function getEventSyllabus(eventId: string, token?: string) {
  return apiRequest<any>(`/events/${eventId}/syllabus`, {
    method: 'GET',
    ...(token ? { token } : {}),
  });
}

export function completeMaterial(materialId: string, token: string) {
  return apiRequest<any>(`/events/materials/${materialId}/complete`, {
    method: 'POST',
    token,
  });
}

export function uncompleteMaterial(materialId: string, token: string) {
  return apiRequest<any>(`/events/materials/${materialId}/complete`, {
    method: 'DELETE',
    token,
  });
}





