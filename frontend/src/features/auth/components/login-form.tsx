'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthPanel } from '../hooks/use-auth-panel';

export function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    setErrors,
    isSubmitting,
    onSubmit,
  } = useAuthPanel();

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Field>
        <Label htmlFor="login-email" required>
          Email
        </Label>
        <Input
          id="login-email"
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
        <Label htmlFor="login-password" required>
          Password
        </Label>
        <Input
          id="login-password"
          type="password"
          aria-required="true"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((prev) => ({ ...prev, password: '' }));
          }}
          placeholder="Masukkan password"
          disabled={isSubmitting}
        />
        <FieldError message={errors.password} />
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
            Sedang login...
          </>
        ) : (
          'Login'
        )}
      </Button>

      <div className="space-y-3 border-t pt-4">
        <p className="text-center text-sm text-[#2E417B]/70 dark:text-slate-400">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-[#2E417B] hover:underline dark:text-blue-400">
            Daftar di sini
          </Link>
        </p>
        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-[#2E417B]/80 hover:text-[#2E417B] dark:text-slate-400 dark:hover:text-slate-300"
          >
            Lupa password?
          </Link>
        </p>
      </div>
    </form>
  );
}
