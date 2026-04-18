'use client';

import { useEffect } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginCard } from '@/features/auth/components/login-card';
import { useAuthPanel } from '@/features/auth/hooks/use-auth-panel';

export default function LoginPage() {
  const {
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    errors,
    setErrors,
    isSubmitting,
    onSubmit,
  } = useAuthPanel();

  useEffect(() => {
    setMode('login');
  }, [setMode]);

  return (
    <AuthShell
      title="Login akun"
      description="Masuk untuk lanjut ke dashboard dan fitur Elchub."
    >
      <LoginCard
        email={email}
        password={password}
        emailError={errors.email}
        passwordError={errors.password}
        isSubmitting={isSubmitting}
        onEmailChange={(value) => {
          setEmail(value);
          setErrors((previous) => ({ ...previous, email: '' }));
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          setErrors((previous) => ({ ...previous, password: '' }));
        }}
        onSubmit={onSubmit}
      />
    </AuthShell>
  );
}
