'use client';

import { ManagementAccessGuard } from '@/features/management/components/management-access-guard';
import { ManagementUsersPanel } from '@/features/management/components/management-users-panel';

export default function ManagementUsersPage() {
  return (
    <ManagementAccessGuard>
      <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              User Management
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage all user accounts in the system. Create, edit, and delete users, manage roles and permissions.
            </p>
          </div>

          <ManagementUsersPanel />
        </div>
      </main>
    </ManagementAccessGuard>
  );
}
