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
            <div key={event.id} data-animate>
              <EventCard event={event} onAction={onEventAction} />
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
