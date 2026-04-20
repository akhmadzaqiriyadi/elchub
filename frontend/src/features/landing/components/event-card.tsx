import { cn } from '@/lib/utils';
import type { Event } from '../types/event';
import { Badge } from './ui/badge';

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  event: Event;
  onAction?: (eventId: string) => void;
}

export function EventCard({ event, onAction, className }: EventCardProps) {
  const getEventTypeLabel = () => {
    const typeMap = {
      webinar: 'Webinar',
      workshop: 'Workshop',
      mentoring: 'Mentoring',
      library: 'Library',
    };
    return typeMap[event.type];
  };

  const getStatusColor = () => {
    const statusMap = {
      live: 'live' as const,
      upcoming: 'primary' as const,
      completed: 'success' as const,
    };
    return statusMap[event.status];
  };

  return (
    <article
      className={cn(
        'group relative overflow-hidden border border-slate-200 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50',
        'hover:border-slate-300 dark:hover:border-slate-600 rounded-lg',
        className
      )}
    >
      {/* Image */}
      {event.image && (
        <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* Badge Status */}
      <div className="mb-3 flex flex-wrap gap-2">
        {event.status === 'live' && <Badge variant="live">Live Now</Badge>}
        {event.isFree && <Badge variant="free">Free</Badge>}
        {event.isExclusive && <Badge variant="exclusive">Exclusive</Badge>}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-[#2E417B] dark:text-white">{event.title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{event.description}</p>

      {/* Meta Info */}
      <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {getEventTypeLabel()}
        </p>
        {event.instructor && (
          <p className="text-sm text-slate-600 dark:text-slate-400">Instruktur: {event.instructor}</p>
        )}
        {event.date && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{event.date}</p>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onAction?.(event.id)}
        className="mt-4 w-full rounded-lg border border-[#2E417B] bg-transparent px-4 py-2 text-sm font-medium text-[#2E417B] transition-colors hover:bg-[#2E417B] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
      >
        Lihat Detail
      </button>
    </article>
  );
}
