'use client';

import type { ReactNode } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/auth-context';

type ManagementAccessGuardProps = {
  children: ReactNode;
};

const allowedRoles = new Set(['ADMIN', 'ORGANIZER']);

export function ManagementAccessGuard({ children }: ManagementAccessGuardProps) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Checking access...</p>
        </div>
      </div>
    );
  }

  const hasAccess = Boolean(user?.role && allowedRoles.has(user.role));

  if (!hasAccess) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/60 dark:bg-amber-950/30">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Access Restricted</h2>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
          Halaman management hanya untuk role ADMIN atau ORGANIZER.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
