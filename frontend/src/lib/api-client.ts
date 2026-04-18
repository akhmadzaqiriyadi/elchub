import axios from 'axios';

import { frontendEnv } from '@/config/env';

export class ApiClientError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

const api = axios.create({
  baseURL: frontendEnv.apiBaseUrl,
  headers: {
    'content-type': 'application/json',
  },
});

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  try {
    const response = await api.request<T>({
      url: path,
      method: options.method ?? 'GET',
      data: options.body,
      headers: options.token ? { authorization: `Bearer ${options.token}` } : undefined,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data ?? null;
      const status = error.response?.status ?? 0;
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof (payload as { message?: unknown }).message === 'string'
          ? (payload as { message: string }).message
          : error.message || `Permintaan gagal dengan status ${status}`;

      throw new ApiClientError(message, status, payload);
    }

    throw error;
  }
}