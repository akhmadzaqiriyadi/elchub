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
      description="Set password baru untuk akun kamu."
    >
      <ResetPasswordCard
        password={resetPasswordInput}
        confirmPassword={resetConfirmPasswordInput}
        passwordError={recoveryErrors.resetPassword}
        confirmPasswordError={recoveryErrors.resetConfirmPassword}
        isSubmitting={isSubmittingReset}
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
