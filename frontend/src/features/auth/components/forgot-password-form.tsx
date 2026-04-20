'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthPanel } from '../hooks/use-auth-panel';
import { CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const {
    forgotEmail,
    setForgotEmail,
    recoveryErrors,
    setRecoveryErrors,
    isSubmittingForgot,
    onForgotPasswordSubmit,
  } = useAuthPanel();

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSuccess(false);
    await onForgotPasswordSubmit(e);
    // Check if submission was successful (no errors)
    if (!recoveryErrors.forgotEmail) {
      setIsSuccess(true);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isSuccess && (
        <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/20">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">Email berhasil dikirim!</p>
            <p className="mt-1 text-xs text-green-800 dark:text-green-300">
              Cek email untuk link reset password
            </p>
          </div>
        </div>
      )}

      <Field>
        <Label htmlFor="forgot-email" required>
          Email
        </Label>
        <Input
          id="forgot-email"
          type="email"
          aria-required="true"
          value={forgotEmail}
          onChange={(event) => {
            setForgotEmail(event.target.value);
            setIsSuccess(false);
            setRecoveryErrors((prev) => ({ ...prev, forgotEmail: '' }));
          }}
          placeholder="kamu@email.com"
          disabled={isSubmittingForgot}
        />
        {recoveryErrors.forgotEmail && !isSuccess && (
          <FieldError message={recoveryErrors.forgotEmail} />
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] dark:bg-blue-600"
        disabled={isSubmittingForgot || isSuccess}
      >
        {isSubmittingForgot ? (
          <>
            <Spinner className="h-4 w-4" />
            Mengirim...
          </>
        ) : (
          'Kirim Link Reset'
        )}
      </Button>

      <div className="space-y-3 border-t pt-4">
        <p className="text-center text-sm text-[#2E417B]/70 dark:text-slate-400">
          <Link href="/login" className="font-semibold text-[#2E417B] hover:underline dark:text-blue-400">
            Kembali ke login
          </Link>
        </p>
      </div>
    </form>
  );
}
