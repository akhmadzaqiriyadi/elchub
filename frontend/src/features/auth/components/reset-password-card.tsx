import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type ResetPasswordCardProps = {
  password: string;
  confirmPassword: string;
  passwordError: string;
  confirmPasswordError: string;
  isSubmitting: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ResetPasswordCard({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  isSubmitting,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ResetPasswordCardProps) {
  return (
    <Card className="rounded-[1.75rem] border-primary/15 bg-white/90 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/85">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Set password baru untuk akun kamu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field>
            <Label htmlFor="reset-password" required>
              Password Baru
            </Label>
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Minimal 8 karakter"
            />
            <FieldError message={passwordError} />
          </Field>

          <Field>
            <Label htmlFor="reset-confirm-password" required>
              Konfirmasi Password
            </Label>
            <Input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              placeholder="Ketik ulang password"
            />
            <FieldError message={confirmPasswordError} />
          </Field>

          <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Memproses...
              </>
            ) : (
              'Simpan Password Baru'
            )}
          </Button>
        </form>

        <div className="mt-4 text-sm text-primary/80 dark:text-slate-300">
          Password sudah di-reset?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline dark:text-slate-100">
            Login sekarang
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
