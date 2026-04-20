'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthPanel } from '../hooks/use-auth-panel';

export function RegisterForm() {
  const {
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

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Field>
        <Label htmlFor="register-name" required>
          Nama Lengkap
        </Label>
        <Input
          id="register-name"
          type="text"
          aria-required="true"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="Nama kamu"
          disabled={isSubmitting}
        />
        <FieldError message={errors.name} />
      </Field>

      <Field>
        <Label htmlFor="register-email" required>
          Email
        </Label>
        <Input
          id="register-email"
          type="email"
          aria-required="true"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="kamu@email.com"
          disabled={isSubmitting}
        />
        <FieldError message={errors.email} />
      </Field>

      <Field>
        <Label htmlFor="register-password" required>
          Password
        </Label>
        <Input
          id="register-password"
          type="password"
          aria-required="true"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((prev) => ({ ...prev, password: '' }));
          }}
          placeholder="Minimal 8 karakter"
          disabled={isSubmitting}
        />
        <FieldError message={errors.password} />
      </Field>

      <Field>
        <Label htmlFor="register-confirm-password" required>
          Konfirmasi Password
        </Label>
        <Input
          id="register-confirm-password"
          type="password"
          aria-required="true"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          placeholder="Ketik ulang password"
          disabled={isSubmitting}
        />
        <FieldError message={errors.confirmPassword} />
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] dark:bg-blue-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="h-4 w-4" />
            Sedang mendaftar...
          </>
        ) : (
          'Daftar Akun'
        )}
      </Button>

      <div className="space-y-3 border-t pt-4">
        <p className="text-center text-sm text-[#2E417B]/70 dark:text-slate-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-[#2E417B] hover:underline dark:text-blue-400">
            Login di sini
          </Link>
        </p>
      </div>
    </form>
  );
}
