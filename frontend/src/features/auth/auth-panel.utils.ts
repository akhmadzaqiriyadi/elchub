import {
  authTokenCookieKey,
  emailRegex,
  initialAuthFormErrors,
  initialRecoveryFormErrors,
} from './auth-panel.constants';
import type { AuthFormErrors, BackendValidationPayload, Mode, RecoveryFormErrors } from './auth-panel.types';

function extractFieldFromPath(path: string) {
  if (path === '/email') {
    return 'email' as const;
  }

  if (path === '/password') {
    return 'password' as const;
  }

  if (path === '/name') {
    return 'name' as const;
  }

  return null;
}

export function readBackendFieldErrors(payload: unknown) {
  const mapped = { ...initialAuthFormErrors };
  const parsed = payload as BackendValidationPayload;

  if (!parsed || typeof parsed !== 'object') {
    return mapped;
  }

  const entries = Array.isArray(parsed.errors)
    ? parsed.errors
    : parsed.property
      ? [{ path: parsed.property, summary: parsed.summary, message: parsed.message }]
      : [];

  for (const entry of entries) {
    if (!entry?.path) {
      continue;
    }

    const field = extractFieldFromPath(entry.path);

    if (!field) {
      continue;
    }

    const message = entry.summary || entry.message || parsed.summary || parsed.message;

    if (message) {
      mapped[field] = message;
    }
  }

  return mapped;
}

export function readBackendRecoveryErrors(payload: unknown) {
  const mapped = { ...initialRecoveryFormErrors };
  const parsed = payload as BackendValidationPayload;

  if (!parsed || typeof parsed !== 'object') {
    return mapped;
  }

  const entries = Array.isArray(parsed.errors)
    ? parsed.errors
    : parsed.property
      ? [{ path: parsed.property, summary: parsed.summary, message: parsed.message }]
      : [];

  for (const entry of entries) {
    if (!entry?.path) {
      continue;
    }

    const message = entry.summary || entry.message || parsed.summary || parsed.message;

    if (!message) {
      continue;
    }

    if (entry.path === '/email') {
      mapped.forgotEmail = message;
    }

    if (entry.path === '/token') {
      mapped.resetToken = message;
    }

    if (entry.path === '/password') {
      mapped.resetPassword = message;
    }
  }

  return mapped;
}

export function readCookieToken() {
  const cookie = typeof document !== 'undefined' ? document.cookie : '';

  if (!cookie) {
    return '';
  }

  const target = cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${authTokenCookieKey}=`));

  if (!target) {
    return '';
  }

  const value = target.slice(`${authTokenCookieKey}=`.length);

  return decodeURIComponent(value);
}

type ValidateAuthFormInput = {
  mode: Mode;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function validateAuthForm(input: ValidateAuthFormInput) {
  const nextErrors: AuthFormErrors = { ...initialAuthFormErrors };
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  const trimmedPassword = input.password.trim();
  const trimmedConfirmPassword = input.confirmPassword.trim();

  if (input.mode === 'register' && trimmedName.length === 0) {
    nextErrors.name = 'Nama wajib diisi.';
  } else if (input.mode === 'register' && trimmedName.length < 2) {
    nextErrors.name = 'Nama minimal 2 karakter.';
  }

  if (trimmedEmail.length === 0) {
    nextErrors.email = 'Email wajib diisi.';
  } else if (!emailRegex.test(trimmedEmail)) {
    nextErrors.email = 'Email tidak valid.';
  }

  if (trimmedPassword.length === 0) {
    nextErrors.password = 'Password wajib diisi.';
  } else if (input.password.length < 8) {
    nextErrors.password = 'Password minimal 8 karakter.';
  }

  if (input.mode === 'register' && trimmedConfirmPassword.length === 0) {
    nextErrors.confirmPassword = 'Konfirmasi password wajib diisi.';
  } else if (input.mode === 'register' && input.password !== input.confirmPassword) {
    nextErrors.confirmPassword = 'Konfirmasi password tidak sama.';
  }

  return nextErrors;
}

export function validateForgotPasswordForm(email: string) {
  const nextErrors: RecoveryFormErrors = { ...initialRecoveryFormErrors };
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    nextErrors.forgotEmail = 'Email wajib diisi.';
  } else if (!emailRegex.test(trimmedEmail)) {
    nextErrors.forgotEmail = 'Email tidak valid.';
  }

  return nextErrors;
}

export function validateResetPasswordForm(input: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const nextErrors: RecoveryFormErrors = { ...initialRecoveryFormErrors };

  if (!input.token.trim()) {
    nextErrors.resetToken = 'Token wajib diisi.';
  }

  if (!input.password.trim()) {
    nextErrors.resetPassword = 'Password baru wajib diisi.';
  } else if (input.password.length < 8) {
    nextErrors.resetPassword = 'Password minimal 8 karakter.';
  }

  if (!input.confirmPassword.trim()) {
    nextErrors.resetConfirmPassword = 'Konfirmasi password wajib diisi.';
  } else if (input.password !== input.confirmPassword) {
    nextErrors.resetConfirmPassword = 'Konfirmasi password tidak sama.';
  }

  return nextErrors;
}
