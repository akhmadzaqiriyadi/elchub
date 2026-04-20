'use client';

import { AuthLayout } from '@/features/auth/components/auth-layout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { useAuthFormAnimation } from '@/features/auth/hooks/use-auth-form-animation';

export default function ResetPasswordPage() {
  const formRef = useAuthFormAnimation({ delay: 0.2 });

  return (
    <AuthLayout
      title="Reset Password"
      description="Masukkan password baru kamu untuk mereset akun"
    >
      <div ref={formRef}>
        <ResetPasswordForm />
      </div>
    </AuthLayout>
  );
}
