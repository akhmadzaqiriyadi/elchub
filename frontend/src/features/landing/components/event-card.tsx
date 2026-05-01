import { cn } from '@/lib/utils';
import Image from 'next/image';
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

  return (
    <article
      className={cn(
        'group relative overflow-hidden border border-slate-200 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50',
        'hover:border-slate-300 dark:hover:border-slate-600 rounded-lg',
        // keep card full-height and column layout so grid items align
        'flex flex-col h-full',
        className
      )}
    >
      {/* Top media area: fixed height with overlay badge so layout never shifts */}
      <div className="relative mb-4 h-48 overflow-hidden rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 sm:h-56">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          // empty placeholder keeps height consistent when image missing
          <div className="w-full h-full" />
        )}

        {/* badges overlay - absolute so they don't push content */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {event.status === 'live' && <Badge variant="live">Live Now</Badge>}
          {event.isFree && <Badge variant="free">Free</Badge>}
          {event.isExclusive && <Badge variant="exclusive">Exclusive</Badge>}
        </div>
      </div>

      {/* Content (grow to push meta & action to bottom) */}
      <div className="flex flex-col flex-1">
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

        {/* clamp description to keep vertical rhythm consistent */}
        <p
          className="mt-2 min-h-[4.5rem] text-sm leading-6 text-slate-600 dark:text-slate-400"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>

        {/* Meta Info */}
        <div className="mt-4 min-h-[5.5rem] space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
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

        {/* Action Button - keep at the bottom with mt-auto so cards align */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => onAction?.(event.id)}
            className="w-full rounded-lg border border-[#2E417B] bg-transparent px-4 py-2 text-sm font-medium text-[#2E417B] transition-colors hover:bg-[#2E417B] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </article>  
  );
}
