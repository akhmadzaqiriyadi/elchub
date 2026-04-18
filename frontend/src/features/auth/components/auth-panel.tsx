'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { useAuthPanel } from '../hooks/use-auth-panel';

export function AuthPanel() {
  const {
    mode,
    setMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    token,
    errors,
    setErrors,
    title,
    me,
    isSubmitting,
    isCheckingSession,
    isLoggingOut,
    onSubmit,
    checkSession,
    onLogout,
    forgotEmail,
    setForgotEmail,
    resetTokenInput,
    setResetTokenInput,
    resetPasswordInput,
    setResetPasswordInput,
    resetConfirmPasswordInput,
    setResetConfirmPasswordInput,
    recoveryErrors,
    setRecoveryErrors,
    isSubmittingForgot,
    isSubmittingReset,
    onForgotPasswordSubmit,
    onResetPasswordSubmit,
  } = useAuthPanel();

  const showAuthForm = mode === 'login' || mode === 'register';

  return (
    <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/85">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Frontend ini sudah terhubung ke backend melalui proxy <span className="font-mono">/api</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <Button
            type="button"
            variant={mode === 'login' ? 'default' : 'secondary'}
            className="h-10 rounded-lg"
            onClick={() => setMode('login')}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={mode === 'register' ? 'default' : 'secondary'}
            className="h-10 rounded-lg"
            onClick={() => setMode('register')}
          >
            Register
          </Button>
          <Button
            type="button"
            variant={mode === 'recovery' ? 'default' : 'secondary'}
            className="h-10 rounded-lg text-xs"
            onClick={() => setMode('recovery')}
          >
            Reset Password
          </Button>
        </div>

        {showAuthForm && (
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === 'register' && (
              <Field>
                <Label htmlFor="auth-name" required>
                  Nama
                </Label>
                <Input
                  id="auth-name"
                  aria-required="true"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setErrors((previous) => ({ ...previous, name: '' }));
                  }}
                  placeholder="Nama kamu"
                />
                <FieldError message={errors.name} />
              </Field>
            )}

            <Field>
              <Label htmlFor="auth-email" required>
                Email
              </Label>
              <Input
                id="auth-email"
                type="email"
                aria-required="true"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((previous) => ({ ...previous, email: '' }));
                }}
                placeholder="kamu@email.com"
              />
              <FieldError message={errors.email} />
            </Field>

            <Field>
              <Label htmlFor="auth-password" required>
                Password
              </Label>
              <Input
                id="auth-password"
                type="password"
                aria-required="true"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((previous) => ({ ...previous, password: '' }));
                }}
                placeholder="Minimal 8 karakter"
              />
              <FieldError message={errors.password} />
            </Field>

            {mode === 'register' && (
              <Field>
                <Label htmlFor="auth-confirm-password" required>
                  Konfirmasi Password
                </Label>
                <Input
                  id="auth-confirm-password"
                  type="password"
                  aria-required="true"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrors((previous) => ({ ...previous, confirmPassword: '' }));
                  }}
                  placeholder="Ketik ulang password"
                />
                <FieldError message={errors.confirmPassword} />
              </Field>
            )}

            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Memproses...
                </>
              ) : mode === 'login' ? (
                'Login'
              ) : (
                'Register'
              )}
            </Button>
          </form>
        )}

        {mode === 'recovery' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="border-b pb-3">
                <h3 className="text-sm font-semibold text-slate-700">Lupa Password</h3>
                <p className="text-xs text-slate-500 mt-1">Masukkan email untuk menerima link reset password</p>
              </div>

              <form className="space-y-3" onSubmit={onForgotPasswordSubmit}>
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
                      setRecoveryErrors((previous) => ({ ...previous, forgotEmail: '' }));
                    }}
                    placeholder="kamu@email.com"
                  />
                  <FieldError message={recoveryErrors.forgotEmail} />
                </Field>

                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmittingForgot}>
                  {isSubmittingForgot ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Link Reset'
                  )}
                </Button>
              </form>
            </div>

            <div className="space-y-3">
              <div className="border-b pb-3">
                <h3 className="text-sm font-semibold text-slate-700">Reset Password</h3>
                <p className="text-xs text-slate-500 mt-1">Gunakan token dari email untuk reset password</p>
              </div>

              <form className="space-y-3" onSubmit={onResetPasswordSubmit}>
                <Field>
                  <Label htmlFor="reset-token" required>
                    Token
                  </Label>
                  <Input
                    id="reset-token"
                    aria-required="true"
                    value={resetTokenInput}
                    onChange={(event) => {
                      setResetTokenInput(event.target.value);
                      setRecoveryErrors((previous) => ({ ...previous, resetToken: '' }));
                    }}
                    placeholder="Paste token dari email"
                  />
                  <FieldError message={recoveryErrors.resetToken} />
                </Field>

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
                      setRecoveryErrors((previous) => ({ ...previous, resetPassword: '' }));
                    }}
                    placeholder="Minimal 8 karakter"
                  />
                  <FieldError message={recoveryErrors.resetPassword} />
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
                      setRecoveryErrors((previous) => ({ ...previous, resetConfirmPassword: '' }));
                    }}
                    placeholder="Ketik ulang password"
                  />
                  <FieldError message={recoveryErrors.resetConfirmPassword} />
                </Field>

                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmittingReset}>
                  {isSubmittingReset ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Memproses...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Session Check</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9 rounded-lg px-3 text-xs"
                onClick={checkSession}
                disabled={isCheckingSession || !token}
              >
                {isCheckingSession ? (
                  <>
                    <Spinner className="h-3.5 w-3.5" />
                    Checking
                  </>
                ) : (
                  'Check /auth/me'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 rounded-lg px-3 text-xs"
                onClick={onLogout}
                disabled={isLoggingOut && Boolean(token)}
              >
                {isLoggingOut ? (
                  <>
                    <Spinner className="h-3.5 w-3.5" />
                    Logout...
                  </>
                ) : (
                  'Logout'
                )}
              </Button>
            </div>
          </div>

          <p className="mt-2 break-all text-xs text-slate-500">Token: {token ? `${token.slice(0, 28)}...` : 'Belum ada'}</p>

          <div className="mt-3">
            {me ? (
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  User: <span className="font-medium">{me.email}</span>
                </p>
                <p>
                  Role: <span className="font-medium">{me.role}</span>
                </p>
              </div>
            ) : isCheckingSession ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Belum ada data session. Klik check setelah login/register.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
