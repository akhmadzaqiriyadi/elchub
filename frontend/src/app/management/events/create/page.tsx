import { ManagementAccessGuard, ManagementEventCreatePage } from '@/features/management';

export default function ManagementEventCreateRoutePage() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary dark:text-slate-100">Create Event</h1>
        <p className="mt-2 text-sm text-primary/70 dark:text-slate-400">
          Halaman khusus untuk bikin event baru dari dashboard management.
        </p>

        <div className="mt-6">
          <ManagementAccessGuard>
            <ManagementEventCreatePage />
          </ManagementAccessGuard>
        </div>
      </div>
    </main>
  );
}
