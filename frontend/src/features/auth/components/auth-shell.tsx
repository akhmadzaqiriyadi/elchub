import Link from 'next/link';

import { ThemeToggle } from '@/components/ui/theme-toggle';

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(46,65,123,0.14),_transparent_38%),linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] text-primary dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_36%),linear-gradient(180deg,_#0b1220_0%,_#111827_100%)] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_20%_20%,rgba(46,65,123,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(46,65,123,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_28%)]" />

      <header className="border-b border-primary/15 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-base font-semibold tracking-tight text-primary dark:text-slate-100">
            Elchub
          </Link>

          <nav className="flex items-center gap-3 text-sm text-primary/80 dark:text-slate-300">
            <Link href="/login" className="hover:text-primary dark:hover:text-slate-100">
              Login
            </Link>
            <Link href="/register" className="hover:text-primary dark:hover:text-slate-100">
              Register
            </Link>
            <Link href="/forgot-password" className="hover:text-primary dark:hover:text-slate-100">
              Lupa Password
            </Link>
            <ThemeToggle className="h-9 w-9" />
          </nav>
        </div>
      </header>

      <section className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-primary dark:text-slate-100">{title}</h1>
            <p className="mt-2 text-sm text-primary/80 dark:text-slate-300">{description}</p>
          </div>
          {children}
        </div>
      </section>

      <footer className="border-t border-primary/15 bg-white/70 py-5 text-center text-sm text-primary/75 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
        <div className="container">Elchub Auth • Secure access • 2026</div>
      </footer>
    </main>
  );
}
