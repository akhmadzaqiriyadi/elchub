import { MyEventsPage } from '@/features/events/components/my-events-page';

export default function MyEventsRoute() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary dark:text-slate-100 mb-2">Event Saya</h1>
        <p className="text-sm text-primary/70 dark:text-slate-400 mb-8">
          Daftar semua event yang telah Anda ikuti dan status pendaftarannya.
        </p>

        <MyEventsPage />
      </div>
    </main>
  );
}
