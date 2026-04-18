import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type ForgotPasswordCardProps = {
  forgotEmail: string;
  forgotEmailError: string;
  isSubmitting: boolean;
  onForgotEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ForgotPasswordCard({
  forgotEmail,
  forgotEmailError,
  isSubmitting,
  onForgotEmailChange,
  onSubmit,
}: ForgotPasswordCardProps) {
  return (
    <Card className="rounded-[1.75rem] border-primary/15 bg-white/90 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/85">
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>Masukkan email, kami kirim link reset password ke inbox kamu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field>
            <Label htmlFor="forgot-email" required>
              Email
            </Label>
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(event) => onForgotEmailChange(event.target.value)}
              placeholder="kamu@email.com"
            />
            <FieldError message={forgotEmailError} />
          </Field>

          <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Mengirim...
              </>
            ) : (
              'Kirim Link Reset'
            )}
          </Button>
        </form>

        <div className="mt-4 text-sm text-primary/80 dark:text-slate-300">
          Sudah ingat password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline dark:text-slate-100">
            Kembali ke login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
