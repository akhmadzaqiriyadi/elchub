'use client';

import { useEffect } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { ResetPasswordCard } from '@/features/auth/components/reset-password-card';
import { useAuthPanel } from '@/features/auth/hooks/use-auth-panel';

export default function ResetPasswordPage() {
  const {
    setMode,
    resetTokenInput,
    setResetTokenInput,
    resetPasswordInput,
    setResetPasswordInput,
    resetConfirmPasswordInput,
    setResetConfirmPasswordInput,
    recoveryErrors,
    setRecoveryErrors,
    isSubmittingReset,
    onResetPasswordSubmit,
  } = useAuthPanel();

  useEffect(() => {
    setMode('recovery');
  }, [setMode]);

  return (
    <AuthShell
      title="Reset password"
      description="Masukkan token dari email lalu buat password baru."
    >
      <ResetPasswordCard
        token={resetTokenInput}
        password={resetPasswordInput}
        confirmPassword={resetConfirmPasswordInput}
        tokenError={recoveryErrors.resetToken}
        passwordError={recoveryErrors.resetPassword}
        confirmPasswordError={recoveryErrors.resetConfirmPassword}
        isSubmitting={isSubmittingReset}
        onTokenChange={(value) => {
          setResetTokenInput(value);
          setRecoveryErrors((previous) => ({ ...previous, resetToken: '' }));
        }}
        onPasswordChange={(value) => {
          setResetPasswordInput(value);
          setRecoveryErrors((previous) => ({ ...previous, resetPassword: '' }));
        }}
        onConfirmPasswordChange={(value) => {
          setResetConfirmPasswordInput(value);
          setRecoveryErrors((previous) => ({ ...previous, resetConfirmPassword: '' }));
        }}
        onSubmit={onResetPasswordSubmit}
      />
    </AuthShell>
  );
}
