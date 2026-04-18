import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type LoginCardProps = {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function LoginCard({
  email,
  password,
  emailError,
  passwordError,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginCardProps) {
  return (
    <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/85">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Masuk ke akun kamu untuk lanjut.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field>
            <Label htmlFor="login-email" required>
              Email
            </Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="kamu@email.com"
            />
            <FieldError message={emailError} />
          </Field>

          <Field>
            <Label htmlFor="login-password" required>
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Masukkan password"
            />
            <FieldError message={passwordError} />
          </Field>

          <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Memproses...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <Link href="/forgot-password" className="hover:text-slate-900 dark:hover:text-slate-100">
            Lupa password?
          </Link>
          <Link href="/register" className="hover:text-slate-900 dark:hover:text-slate-100">
            Belum punya akun?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
