import { apiRequest } from '@/lib/api-client';
import { AuthUser } from '@/features/auth/types';

export type UpdateProfileInput = {
  name?: string | null;
};

export type UpdateProfilePayload = {
  success: boolean;
  data: {
    user: AuthUser;
  };
};

export type ProfilePhotoUploadPayload = {
  success: boolean;
  data: {
    imageUrl: string;
    user: AuthUser;
  };
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordPayload = {
  success: boolean;
  message: string;
};

/**
 * Update current user profile
 */
export function updateProfile(input: UpdateProfileInput, token: string) {
  return apiRequest<UpdateProfilePayload>('/users/me', {
    method: 'PATCH',
    body: input,
    token,
  });
}

/**
 * Upload profile photo
 */
export function uploadProfilePhoto(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<ProfilePhotoUploadPayload>('/users/me/profile-photo', {
    method: 'POST',
    body: formData,
    token,
  });
}

/**
 * Change current user password
 */
export function changePassword(input: ChangePasswordInput, token: string) {
  return apiRequest<ChangePasswordPayload>('/users/me/change-password', {
    method: 'PATCH',
    body: input,
    token,
  });
}
