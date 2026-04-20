'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  showBackButton = true,
  backHref = '/auth',
}: AuthLayoutProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(46,65,123,0.14),_transparent_38%),linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] text-[#2E417B] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_36%),linear-gradient(180deg,_#0b1220_0%,_#111827_100%)] dark:text-slate-100">
      {/* Gradient background decorations */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_20%_20%,rgba(46,65,123,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(46,65,123,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_28%)]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#2E417B]/10 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-[#2E417B] transition-opacity hover:opacity-80 dark:text-slate-100"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2E417B] to-[#1f2a52] dark:from-blue-600 dark:to-blue-800" />
            UCH Connection
          </Link>

          <button className="h-9 w-9 rounded-lg border border-[#2E417B]/20 bg-white/50 transition-colors hover:bg-white dark:border-slate-600 dark:bg-slate-800/50 dark:hover:bg-slate-800">
            <ThemeToggle className="h-full w-full" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <section className="container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-8 sm:py-16">
        <div className="w-full max-w-md">
          {/* Back button */}
          {showBackButton && (
            <Link
              href={backHref}
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2E417B]/70 transition-colors hover:text-[#2E417B] dark:text-slate-400 dark:hover:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          )}

          {/* Title and description */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#2E417B] dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-[#2E417B]/70 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {/* Form content */}
          {children}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2E417B]/10 bg-white/70 py-4 text-center text-xs text-[#2E417B]/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
        <div className="container">
          © 2026 UCH Connection. Semua hak dilindungi. •{' '}
          <Link href="/" className="hover:text-[#2E417B] dark:hover:text-slate-300">
            Beranda
          </Link>
          {' • '}
          <Link href="/privacy" className="hover:text-[#2E417B] dark:hover:text-slate-300">
            Privasi
          </Link>
        </div>
      </footer>
    </main>
  );
}
