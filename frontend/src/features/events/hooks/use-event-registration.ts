import { useMutation } from '@tanstack/react-query';
import { registerEvent, uploadPaymentProof, type RegisterEventInput } from '../api';

export function useEventRegistration() {
  return useMutation({
    mutationFn: async ({
      eventId,
      input,
      token,
    }: {
      eventId: string;
      input: RegisterEventInput;
      token: string;
    }) => {
      const response = await registerEvent(eventId, input, token);
      return response.data;
    },
  });
}

export function usePaymentProofUpload() {
  return useMutation({
    mutationFn: async ({ file, token }: { file: File; token: string }) => {
      const response = await uploadPaymentProof(file, token);
      return response.data;
    },
  });
}
