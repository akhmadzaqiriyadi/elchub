'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMyEvents } from '../hooks/use-my-events';
import { EventBadge } from './event-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';

export function MyEventsPage() {
  const { data, isLoading, error } = useMyEvents();
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(3);

  const rawItems = data?.data ?? [];

  // Client-side search filtering
  const filteredItems = rawItems.filter((item: any) => {
    if (!searchInput) return true;
    const s = searchInput.toLowerCase();
    return (
      (item.event.title || '').toLowerCase().includes(s) ||
      (item.event.type?.name || '').toLowerCase().includes(s)
    );
  });

  // Client-side pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const safePage = Math.min(page, totalPages);
  
  const startIndex = (safePage - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filteredItems.slice(startIndex, endIndex);

  const paginationMeta = {
    page: safePage,
    limit,
    total: totalItems,
    totalPages,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <p className="text-lg text-slate-500">Memuat event Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-12">
        <p className="text-lg text-red-500">Gagal memuat event. Silakan coba lagi.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Event Saya</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Daftar semua event yang telah Anda ikuti dan status pendaftarannya.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari event Anda..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-lg text-slate-500 mb-4">
              {searchInput ? 'Event tidak ditemukan' : 'Anda belum mendaftar ke event apa pun.'}
            </p>
            {!searchInput && (
              <Link href="/events">
                <Button className="bg-[#2E417B] hover:bg-[#1f2a52] text-white">Cari Event</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const { event, statusCode, paymentStatus, registeredAt } = item as any; // Allow mixed types temporarily

        const formattedDate = event.startAt 
          ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(event.startAt))
          : '-';

        return (
          <article
            key={item.registrationId}
            className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600"
          >
            {/* Top media area: fixed height with overlay badge so layout never shifts */}
            <div className="relative mb-4 h-48 overflow-hidden rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 sm:h-56">
              {event.image ? (
                <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16m10-16v16M5 8h14M5 16h14" />
                  </svg>
                </div>
              )}
              
              {/* Status Badges Overlay */}
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  item.status === 'REGISTERED' || statusCode === 'REGISTERED' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                  item.status === 'REJECTED' || statusCode === 'REJECTED' 
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                  'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}>
                  {item.status || statusCode || 'UNKNOWN'}
                </span>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  paymentStatus === 'PAID' || paymentStatus === 'FREE' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                  paymentStatus === 'WAITING_VERIFICATION' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                  paymentStatus === 'REJECTED' 
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                  'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}>
                  {paymentStatus === 'FREE' ? 'Gratis' : paymentStatus}
                </span>
              </div>
            </div>

            {/* Content (grow to push meta & action to bottom) */}
            <div className="flex flex-1 flex-col">
              <h3
                className="min-h-[3.5rem] text-lg font-semibold leading-snug text-[#2E417B] dark:text-white"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {event.title}
              </h3>

              {/* Meta Info */}
              <div className="mt-4 min-h-[5.5rem] space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {event.type?.name || 'Event'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Mode: {event.mode?.name === 'Online' ? 'Online' : (event.meetLink ? 'Lihat Link' : 'Offline')}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tanggal: {formattedDate}
                </p>
              </div>

              {/* Action Button - keep at the bottom with mt-auto so cards align */}
              <div className="mt-auto pt-4">
                <Link href={`/events/${event.slug || event.id}`} className="block w-full">
                  <button className="w-full rounded-lg border border-[#2E417B] bg-transparent px-4 py-2 text-sm font-medium text-[#2E417B] transition-colors hover:bg-[#2E417B] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white">
                    Detail Event
                  </button>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                page={paginationMeta.page}
                limit={paginationMeta.limit}
                total={paginationMeta.total}
                totalPages={paginationMeta.totalPages}
                isLoading={isLoading}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
    </section>
  );
}
