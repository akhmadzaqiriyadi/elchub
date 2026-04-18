import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type RegisterCardProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  nameError: string;
  emailError: string;
  passwordError: string;
  confirmPasswordError: string;
  isSubmitting: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function RegisterCard({
  name,
  email,
  password,
  confirmPassword,
  nameError,
  emailError,
  passwordError,
  confirmPasswordError,
  isSubmitting,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: RegisterCardProps) {
  return (
    <Card className="rounded-[1.75rem] border-primary/15 bg-white/90 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/85">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Buat akun baru untuk mulai pakai Elchub.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field>
            <Label htmlFor="register-name" required>
              Nama
            </Label>
            <Input
              id="register-name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Nama kamu"
            />
            <FieldError message={nameError} />
          </Field>

          <Field>
            <Label htmlFor="register-email" required>
              Email
            </Label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="kamu@email.com"
            />
            <FieldError message={emailError} />
          </Field>

          <Field>
            <Label htmlFor="register-password" required>
              Password
            </Label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Minimal 8 karakter"
            />
            <FieldError message={passwordError} />
          </Field>

          <Field>
            <Label htmlFor="register-confirm-password" required>
              Konfirmasi Password
            </Label>
            <Input
              id="register-confirm-password"
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
              'Register'
            )}
          </Button>
        </form>

        <div className="mt-4 text-sm text-primary/80 dark:text-slate-300">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline dark:text-slate-100">
            Login di sini
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
