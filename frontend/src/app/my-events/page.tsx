import { MyEventsPage } from '@/features/events/components/my-events-page';

export default function MyEventsRoute() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-8 dark:bg-slate-900 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MyEventsPage />
      </div>
    </main>
  );
}
