'use client';

import { AuthLayout } from '@/features/auth/components/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';
import { useAuthFormAnimation } from '@/features/auth/hooks/use-auth-form-animation';

export default function RegisterPage() {
  const formRef = useAuthFormAnimation({ delay: 0.2 });

  return (
    <AuthLayout
      title="Daftar Akun Baru"
      description="Buat akun untuk bergabung dengan UCH Connection"
    >
      <div ref={formRef}>
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
