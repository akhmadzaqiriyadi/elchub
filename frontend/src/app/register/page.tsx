'use client';

import { useEffect } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { RegisterCard } from '@/features/auth/components/register-card';
import { useAuthPanel } from '@/features/auth/hooks/use-auth-panel';

export default function RegisterPage() {
  const {
    setMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    setErrors,
    isSubmitting,
    onSubmit,
  } = useAuthPanel();

  useEffect(() => {
    setMode('register');
  }, [setMode]);

  return (
    <AuthShell
      title="Buat akun baru"
      description="Daftar sekali, lalu kamu bisa login dan pakai semua flow auth."
    >
      <RegisterCard
        name={name}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        nameError={errors.name}
        emailError={errors.email}
        passwordError={errors.password}
        confirmPasswordError={errors.confirmPassword}
        isSubmitting={isSubmitting}
        onNameChange={(value) => {
          setName(value);
          setErrors((previous) => ({ ...previous, name: '' }));
        }}
        onEmailChange={(value) => {
          setEmail(value);
          setErrors((previous) => ({ ...previous, email: '' }));
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          setErrors((previous) => ({ ...previous, password: '' }));
        }}
        onConfirmPasswordChange={(value) => {
          setConfirmPassword(value);
          setErrors((previous) => ({ ...previous, confirmPassword: '' }));
        }}
        onSubmit={onSubmit}
      />
    </AuthShell>
  );
}
