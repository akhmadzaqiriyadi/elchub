'use client';

import { useEffect } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { ForgotPasswordCard } from '@/features/auth/components/forgot-password-card';
import { useAuthPanel } from '@/features/auth/hooks/use-auth-panel';

export default function ForgotPasswordPage() {
  const {
    setMode,
    forgotEmail,
    setForgotEmail,
    recoveryErrors,
    setRecoveryErrors,
    isSubmittingForgot,
    onForgotPasswordSubmit,
  } = useAuthPanel();

  useEffect(() => {
    setMode('recovery');
  }, [setMode]);

  return (
    <AuthShell
      title="Lupa password"
      description="Kirim link reset password ke email akun kamu."
    >
      <ForgotPasswordCard
        forgotEmail={forgotEmail}
        forgotEmailError={recoveryErrors.forgotEmail}
        isSubmitting={isSubmittingForgot}
        onForgotEmailChange={(value) => {
          setForgotEmail(value);
          setRecoveryErrors((previous) => ({ ...previous, forgotEmail: '' }));
        }}
        onSubmit={onForgotPasswordSubmit}
      />
    </AuthShell>
  );
}
