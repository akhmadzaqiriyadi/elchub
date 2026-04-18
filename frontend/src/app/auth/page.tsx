import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { AuthShell } from '@/features/auth/components/auth-shell';

const links = [
  { href: '/login', title: 'Login', description: 'Masuk ke akun yang sudah ada.' },
  { href: '/register', title: 'Register', description: 'Buat akun baru.' },
  { href: '/forgot-password', title: 'Lupa Password', description: 'Kirim email reset password.' },
  { href: '/reset-password', title: 'Reset Password', description: 'Set password baru dengan token.' },
];

export default function AuthIndexPage() {
  return (
    <AuthShell
      title="Auth pages"
      description="Pilih flow auth yang mau kamu akses."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full rounded-2xl border-primary/15 bg-white/90 transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm font-medium text-primary">Open page</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AuthShell>
  );
}
