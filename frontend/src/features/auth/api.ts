import { apiRequest } from '@/lib/api-client';

import type {
  AuthForgotPasswordPayload,
  AuthLogoutPayload,
  AuthMePayload,
  AuthResetPasswordPayload,
  AuthSuccessPayload,
} from './types';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export function register(input: RegisterInput) {
  return apiRequest<AuthSuccessPayload>('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export function login(input: LoginInput) {
  return apiRequest<AuthSuccessPayload>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export function getMe(token: string) {
  return apiRequest<AuthMePayload>('/auth/me', {
    method: 'GET',
    token,
  });
}

export function logout(token: string) {
  return apiRequest<AuthLogoutPayload>('/auth/logout', {
    method: 'POST',
    token,
  });
}

export function forgotPassword(email: string) {
  return apiRequest<AuthForgotPasswordPayload>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export function resetPassword(input: { token: string; password: string }) {
  return apiRequest<AuthResetPasswordPayload>('/auth/reset-password', {
    method: 'POST',
    body: input,
  });
}