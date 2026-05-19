/**
 * Events Listing Page
 * Displays all available events/webinars with filtering
 */

'use client';

import { useState } from 'react';
import { EventCard, EventFilter, usePublicEvents } from '@/features/events';
import { Spinner } from '@/components/ui/spinner';

interface FilterState {
  category: string | null;
  type: string | null;
  level: string | null;
  searchQuery: string;
  isFree: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  startDate: string | null;
  endDate: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const categoryMap: Record<string, string> = {
  'Workshop': 'workshop',
  'Webinar': 'webinar',
  'Mentoring': 'mentoring',
  'Hackathon': 'hackathon',
  'Networking': 'networking'
};

const modeMap: Record<string, string> = {
  'Online': 'online',
  'Offline': 'offline',
  'Hybrid': 'hybrid'
};

const levelMap: Record<string, string> = {
  'Beginner': 'beginner',
  'Intermediate': 'intermediate',
  'Advanced': 'advanced'
};

export default function EventsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    type: null,
    level: null,
    searchQuery: '',
    isFree: null,
    minPrice: null,
    maxPrice: null,
    startDate: null,
    endDate: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading } = usePublicEvents({
    q: filters.searchQuery || undefined,
    typeSlug: filters.category ? categoryMap[filters.category] : undefined,
    modeSlug: filters.type ? modeMap[filters.type] : undefined,
    levelSlug: filters.level ? levelMap[filters.level] : undefined,
    isFree: filters.isFree || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    statusCode: 'PUBLISHED',
  });

  const events = data?.items || [];
  const total = data?.pagination?.total || 0;

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-slate-100">
            Events & Webinar
          </h1>
          <p className="mt-2 text-sm sm:text-base text-primary/70 dark:text-slate-400">
            Jelajahi berbagai event, workshop, dan kesempatan belajar bersama expert
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EventFilter onFilter={setFilters} />
            </div>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : events.length > 0 ? (
              <>
                {/* Results Summary */}
                <div className="mb-6">
                  <p className="text-sm text-primary/70 dark:text-slate-400">
                    Menampilkan <span className="font-semibold">{events.length}</span> dari{' '}
                    <span className="font-semibold">{total}</span> event
                  </p>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {events.map((event: any) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      description={event.description || ''}
                      date={event.startAt ? new Date(event.startAt).toLocaleDateString('id-ID') : 'TBD'}
                      time={event.startAt ? new Date(event.startAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      location={event.mode.name}
                      category={event.type.name}
                      price={event.price || 0}
                      attendees={event.attendees || 0}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-primary/20 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-primary/30 dark:text-slate-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-base font-medium text-primary dark:text-slate-100">
                  Tidak ada event yang sesuai
                </p>
                <p className="text-sm text-primary/60 dark:text-slate-400 mt-1">
                  Coba ubah filter untuk menemukan event yang Anda cari
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


