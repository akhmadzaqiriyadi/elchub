import { ManagementAccessGuard } from '@/features/management';
import { ManagementEventRegistrationsPanel } from '@/features/management/components/management-event-registrations-panel';

export default async function EventRegistrationsRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary dark:text-slate-100">Verifikasi Pendaftar</h1>
        <p className="mt-2 text-sm text-primary/70 dark:text-slate-400">
          Halaman verifikasi pendaftar dari dashboard management.
        </p>

        <div className="mt-6">
          <ManagementAccessGuard>
            <ManagementEventRegistrationsPanel eventId={resolvedParams.id} />
          </ManagementAccessGuard>
        </div>
      </div>
    </main>
  );
}
