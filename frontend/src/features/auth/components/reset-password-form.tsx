'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthPanel } from '../hooks/use-auth-panel';
import { CheckCircle } from 'lucide-react';

export function ResetPasswordForm() {
  const {
    resetPasswordInput,
    setResetPasswordInput,
    resetConfirmPasswordInput,
    setResetConfirmPasswordInput,
    recoveryErrors,
    setRecoveryErrors,
    isSubmittingReset,
    onResetPasswordSubmit,
  } = useAuthPanel();

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSuccess(false);
    await onResetPasswordSubmit(e);
    // Check if submission was successful (no errors)
    const hasErrors =
      recoveryErrors.resetPassword?.length > 0 ||
      recoveryErrors.resetConfirmPassword?.length > 0;
    if (!hasErrors) {
      setIsSuccess(true);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isSuccess && (
        <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/20">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">Password berhasil direset!</p>
            <p className="mt-1 text-xs text-green-800 dark:text-green-300">
              Kamu bisa login dengan password baru sekarang
            </p>
          </div>
        </div>
      )}

      <Field>
        <Label htmlFor="reset-password" required>
          Password Baru
        </Label>
        <Input
          id="reset-password"
          type="password"
          aria-required="true"
          value={resetPasswordInput}
          onChange={(event) => {
            setResetPasswordInput(event.target.value);
            setIsSuccess(false);
            setRecoveryErrors((prev) => ({ ...prev, resetPassword: '' }));
          }}
          placeholder="Password baru minimal 8 karakter"
          disabled={isSubmittingReset}
        />
        {recoveryErrors.resetPassword && !isSuccess && (
          <FieldError message={recoveryErrors.resetPassword} />
        )}
      </Field>

      <Field>
        <Label htmlFor="reset-confirm-password" required>
          Konfirmasi Password
        </Label>
        <Input
          id="reset-confirm-password"
          type="password"
          aria-required="true"
          value={resetConfirmPasswordInput}
          onChange={(event) => {
            setResetConfirmPasswordInput(event.target.value);
            setIsSuccess(false);
            setRecoveryErrors((prev) => ({ ...prev, resetConfirmPassword: '' }));
          }}
          placeholder="Ketik ulang password"
          disabled={isSubmittingReset}
        />
        {recoveryErrors.resetConfirmPassword && !isSuccess && (
          <FieldError message={recoveryErrors.resetConfirmPassword} />
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] dark:bg-blue-600"
        disabled={isSubmittingReset || isSuccess}
      >
        {isSubmittingReset ? (
          <>
            <Spinner className="h-4 w-4" />
            Mereset password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>

      {isSuccess && (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full rounded-lg"
          href="/login"
        >
          Pergi ke Login
        </Button>
      )}

      <div className="border-t pt-4">
        <p className="text-center text-sm text-[#2E417B]/70 dark:text-slate-400">
          <Link href="/login" className="font-semibold text-[#2E417B] hover:underline dark:text-blue-400">
            Kembali ke login
          </Link>
        </p>
      </div>
    </form>
  );
}
