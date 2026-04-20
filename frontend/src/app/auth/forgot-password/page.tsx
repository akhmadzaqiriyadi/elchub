'use client';

import { AuthLayout } from '@/features/auth/components/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { useAuthFormAnimation } from '@/features/auth/hooks/use-auth-form-animation';

export default function ForgotPasswordPage() {
  const formRef = useAuthFormAnimation({ delay: 0.2 });

  return (
    <AuthLayout
      title="Lupa Password?"
      description="Masukkan email kamu untuk menerima link reset password"
    >
      <div ref={formRef}>
        <ForgotPasswordForm />
      </div>
    </AuthLayout>
  );
}
