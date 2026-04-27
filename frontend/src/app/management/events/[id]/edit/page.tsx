import { ManagementEventEditPage } from '@/features/management/components/management-event-edit-page';
import { ManagementAccessGuard } from '@/features/management';

export default async function EventEditRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary dark:text-slate-100">Edit Event</h1>
        <p className="mt-2 text-sm text-primary/70 dark:text-slate-400">
          Halaman khusus untuk mengedit event dari dashboard management.
        </p>

        <div className="mt-6">
          <ManagementAccessGuard>
            <ManagementEventEditPage eventId={resolvedParams.id} />
          </ManagementAccessGuard>
        </div>
      </div>
    </main>
  );
}
