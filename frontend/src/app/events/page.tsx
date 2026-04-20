/**
 * Events Listing Page
 * Displays all available events/webinars with filtering
 */

'use client';

import { useState } from 'react';
import { EventCard, EventFilter } from '@/features/events';
import { Spinner } from '@/components/ui/spinner';

// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'React Advanced Patterns Workshop',
    description: 'Pelajari advanced patterns dalam React untuk membuat aplikasi yang lebih scalable.',
    date: '20 Apr 2026',
    time: '14:00 - 17:00',
    location: 'Online',
    category: 'Workshop',
    badge: 'upcoming' as const,
    attendees: 156,
    price: 0,
  },
  {
    id: '2',
    title: 'Web Development Masterclass',
    description: 'Sesi intensif dengan praktik langsung tentang web development modern.',
    date: '22 Apr 2026',
    time: '10:00 - 12:00',
    location: 'Jakarta, Indonesia',
    category: 'Workshop',
    badge: 'upcoming' as const,
    attendees: 89,
    price: 150000,
  },
  {
    id: '3',
    title: 'AI & Machine Learning Basics',
    description: 'Pengenalan fundamental AI/ML untuk developer pemula.',
    date: '25 Apr 2026',
    time: '16:00 - 17:30',
    location: 'Online',
    category: 'Webinar',
    badge: 'upcoming' as const,
    attendees: 234,
    price: 0,
  },
  {
    id: '4',
    title: 'Mentoring One-on-One Session',
    description: 'Sesi mentoring personal dengan expert untuk career guidance.',
    date: '21 Apr 2026',
    time: '15:00 - 16:00',
    location: 'Online',
    category: 'Mentoring',
    badge: 'featured' as const,
    attendees: 12,
    price: 500000,
  },
  {
    id: '5',
    title: 'Hackathon 2026: Innovation Challenge',
    description: 'Kompetisi hackathon dengan hadiah total Rp 500 juta.',
    date: '01 May 2026',
    time: '08:00 - 20:00',
    location: 'Jakarta, Indonesia',
    category: 'Hackathon',
    badge: 'upcoming' as const,
    attendees: 345,
    price: 0,
  },
  {
    id: '6',
    title: 'TypeScript Deep Dive',
    description: 'Explore TypeScript advanced features dan best practices.',
    date: '23 Apr 2026',
    time: '13:00 - 15:00',
    location: 'Online',
    category: 'Workshop',
    badge: 'upcoming' as const,
    attendees: 198,
    price: 0,
  },
];

interface FilterState {
  category: string | null;
  type: string | null;
  searchQuery: string;
}

export default function EventsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    type: null,
    searchQuery: '',
  });
  const [isLoading] = useState(false);

  const filteredEvents = mockEvents.filter((event) => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
            ) : filteredEvents.length > 0 ? (
              <>
                {/* Results Summary */}
                <div className="mb-6">
                  <p className="text-sm text-primary/70 dark:text-slate-400">
                    Menampilkan <span className="font-semibold">{filteredEvents.length}</span> dari{' '}
                    <span className="font-semibold">{mockEvents.length}</span> event
                  </p>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      {...event}
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
