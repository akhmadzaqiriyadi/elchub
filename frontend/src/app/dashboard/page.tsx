'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/auth-context';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-sm text-primary/70 dark:text-slate-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary dark:text-slate-100">Dashboard</h1>
        <p className="mt-2 text-sm text-primary/70 dark:text-slate-400">
          Halo, {user.name ?? user.email}. Kamu sudah berhasil login.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/profile"
            className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            Buka Profile
          </Link>
          <Link
            href="/settings"
            className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            Buka Settings
          </Link>
        </div>
      </div>
    </main>
  );
}
