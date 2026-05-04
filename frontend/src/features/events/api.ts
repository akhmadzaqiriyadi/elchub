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




