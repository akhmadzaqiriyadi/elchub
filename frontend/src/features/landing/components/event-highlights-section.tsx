import Image from 'next/image';
import type { Event } from '../types/event';
import { EventCard } from './event-card';
import { SectionContainer, SectionHeader } from './ui/section-container';
import { useScrollAnimationStagger } from '../hooks/use-scroll-animation';

interface EventHighlightsSectionProps {
  events?: Event[];
  onEventAction?: (eventId: string) => void;
}

// Mock events untuk demo
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Memulai Karir di Tech',
    description: 'Panduan lengkap untuk pemula yang ingin memasuki industri teknologi',
    type: 'webinar',
    status: 'live',
    isFree: true,
    isExclusive: false,
    date: 'Hari ini, 18:00 WIB',
    instructor: 'Ahmad Riyaldi',
  },
  {
    id: '2',
    title: 'Advanced React Patterns Workshop',
    description: 'Pelajari pattern-pattern advanced dalam React untuk project production-ready',
    type: 'workshop',
    status: 'upcoming',
    isFree: false,
    isExclusive: true,
    date: '22 April 2026',
    instructor: 'Sarah Chen',
  },
  {
    id: '3',
    title: 'Personal Mentoring - Web Development',
    description: 'Sesi one-on-one mentoring dengan mentor berpengalaman di industri',
    type: 'mentoring',
    status: 'upcoming',
    isFree: false,
    isExclusive: true,
    date: '25 April 2026',
    instructor: 'Budi Santoso',
  },
];

export function EventHighlightsSection({
  events = MOCK_EVENTS,
  onEventAction,
}: EventHighlightsSectionProps) {
  const containerRef = useScrollAnimationStagger({ delay: 0.1, stagger: 0.15 });

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div 
              key={event.id} 
              data-animate 
              className="flex flex-col overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/50"
            >
              {/* Banner Image */}
              <div className="h-40 flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                <Image
                  src="/images/landing/event.webp"
                  alt="Event Banner"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              
              {/* Event Card Content */}
              <EventCard event={event} onAction={onEventAction} className="border-0 rounded-none shadow-none hover:shadow-none" />
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
