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
    isFree: boolean;
    price: number | null;
    formSchema: any | null;
    type: { name: string; slug: string };
    mode: { name: string; slug: string };
    level: { id: string; name: string; slug: string } | null;
    status: { code: string; name: string };
    organizer: { id: string; name: string | null; email: string };
    attendees?: number;
    createdAt: string;
    updatedAt: string;
  };
};

export function getEventDetail(slug: string) {
  return apiRequest<EventDetailPayload>(`/events/${slug}`, {
    method: 'GET',
  });
}

// ============================================================================
// My Events API
// ============================================================================

export type MyEventItem = {
  registrationId: string;
  status: string;
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

export type MyEventsPayload = {
  success: boolean;
  data: MyEventItem[];
};

export function getMyEvents(token: string) {
  return apiRequest<MyEventsPayload>('/events/my-events', {
    method: 'GET',
    token,
  });
}
