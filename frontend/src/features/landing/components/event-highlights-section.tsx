'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { Event } from '../types/event';
import { EventCard } from './event-card';
import { SectionContainer, SectionHeader } from './ui/section-container';
import { useScrollAnimationStagger } from '../hooks/use-scroll-animation';
import { getLandingEventHighlights } from '../api';

interface EventHighlightsSectionProps {
  onEventAction?: (eventId: string) => void;
}

export function EventHighlightsSection({
  onEventAction,
}: EventHighlightsSectionProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['landing', 'event-highlights'],
    queryFn: getLandingEventHighlights,
    staleTime: 1000 * 60 * 5,
  });

  const containerRef = useScrollAnimationStagger({ delay: 0.1, stagger: 0.15 });
  const allEvents = data ?? [];
  const displayedEvents = allEvents.slice(0, 3);
  const hasMoreEvents = allEvents.length > 3;

  return (
    <SectionContainer
      background="none"
      ref={containerRef as React.RefObject<HTMLDivElement>}
    >
      <div className="container">
        <SectionHeader
          title="Event Highlights"
          subtitle="Berbagai event menarik menunggu Anda. Pilih yang paling sesuai dengan tujuan pembelajaran Anda."
        />

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50"
              >
                <div className="h-48 rounded-t-lg bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-6 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            Gagal memuat event highlights.
          </div>
        )}

        {!isLoading && !isError && allEvents.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            Belum ada event publik yang bisa ditampilkan.
          </div>
        )}

        {!isLoading && !isError && allEvents.length > 0 && (
          <div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedEvents.map((event) => (
                <div key={event.id} data-animate>
                  <EventCard event={event} onAction={onEventAction} className="h-full" />
                </div>
              ))}
            </div>

            {/* Show More Button - Always visible when there are more events */}
            {hasMoreEvents && (
              <div className="flex justify-center items-center mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => router.push('/events')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-[1px] border-[#2E417B] bg-white px-6 py-2 text-base text-[#2E417B] shadow-md transition-all duration-200 hover:bg-[#2E417B] hover:text-white dark:border-blue-500 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  <span>Lihat Semua Event ({allEvents.length})</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
