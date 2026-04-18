import type { AuthFormErrors } from './auth-panel.types';
import type { RecoveryFormErrors } from './auth-panel.types';

export const initialAuthFormErrors: AuthFormErrors = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const initialRecoveryFormErrors: RecoveryFormErrors = {
  forgotEmail: '',
  resetToken: '',
  resetPassword: '',
  resetConfirmPassword: '',
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const authTokenStorageKey = 'elchub_access_token';
export const authTokenCookieKey = 'elchub_access_token';
