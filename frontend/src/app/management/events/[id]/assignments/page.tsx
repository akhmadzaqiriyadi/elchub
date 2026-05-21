import { AssignmentsBuilder } from '@/features/management';
import { ManagementAccessGuard } from '@/features/management';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function EventAssignmentsRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/management/events/${eventId}/edit`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Edit Event
          </Link>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-slate-100 font-sans">Manajemen Tugas / Assignment</h1>
          <p className="text-sm text-primary/70 dark:text-slate-400">
            Kelola tugas dan evaluasi pengumpulan tugas mahasiswa untuk event ini.
          </p>
        </div>

        <div className="mt-6">
          <ManagementAccessGuard>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <AssignmentsBuilder eventId={eventId} />
            </section>
          </ManagementAccessGuard>
        </div>
      </div>
    </main>
  );
}
