export type Mode = 'login' | 'register' | 'recovery';

export type AuthFormErrors = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RecoveryFormErrors = {
  forgotEmail: string;
  resetToken: string;
  resetPassword: string;
  resetConfirmPassword: string;
};

export type BackendValidationItem = {
  path?: string;
  summary?: string;
  message?: string;
};

export type BackendValidationPayload = {
  summary?: string;
  message?: string;
  property?: string;
  errors?: BackendValidationItem[];
};
