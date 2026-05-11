'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { EventSyllabusView } from '@/features/events';
import { useEventDetail } from '@/features/events/hooks/use-event-detail';
import Link from 'next/link';

export default function EventSyllabusPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { token } = useAuth();
  
  const { data: event } = useEventDetail(eventId, token ?? undefined);

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2E417B] dark:text-blue-400 hover:opacity-70 mb-6 group transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:-translate-x-1 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Kembali ke Detail Event
        </Link>

        <div className="mb-10">
          <span className="text-[10px] font-bold text-[#2E417B] dark:text-blue-400 uppercase tracking-[0.2em]">Kurikulum Lengkap</span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {event?.title || 'Memuat Event...'}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            Lihat semua daftar bab dan materi pembelajaran yang tersedia dalam event ini.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/50 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <EventSyllabusView eventId={eventId} token={token ?? undefined} />
        </div>
        
        <div className="mt-12 text-center p-8 rounded-3xl bg-slate-900 dark:bg-blue-600 text-white shadow-2xl shadow-blue-500/20">
          <h3 className="text-xl font-bold mb-2">Siap untuk Memulai?</h3>
          <p className="text-blue-100/70 text-sm mb-6 max-w-md mx-auto">
            Daftar sekarang dan dapatkan akses penuh ke semua materi pembelajaran di atas.
          </p>
          <Link
            href={`/events/${eventId}/register`}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-slate-900 transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Daftar Event Sekarang
          </Link>
        </div>
      </div>
    </main>
  );
}
