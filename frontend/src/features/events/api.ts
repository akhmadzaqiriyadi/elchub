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
