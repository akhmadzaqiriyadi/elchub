'use client';

import { AuthLayout } from '@/features/auth/components/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuthFormAnimation } from '@/features/auth/hooks/use-auth-form-animation';

export default function LoginPage() {
  const formRef = useAuthFormAnimation({ delay: 0.2 });

  return (
    <AuthLayout
      title="Login ke Akun"
      description="Masukkan email dan password untuk mengakses akun kamu"
    >
      <div ref={formRef}>
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
