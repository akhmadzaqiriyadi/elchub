/**
 * Event Card Component
 * Displays event in a card format with image, title, date, and action
 */

import { Button } from '@/components/ui/button';
import { EventBadge } from './event-badge';
import Link from 'next/link';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  badge?: 'live' | 'upcoming' | 'free' | 'paid' | 'featured';
  attendees?: number;
  price?: number;
  onClick?: () => void;
}

export function EventCard({
  id,
  title,
  description,
  date,
  time,
  location,
  category,
  image,
  badge,
  attendees,
  price,
  onClick,
}: EventCardProps) {
  return (
    <div className="rounded-xl border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-primary/10 dark:bg-slate-700">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-primary/30 dark:text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16m10-16v16M5 8h14M5 16h14"
              />
            </svg>
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 right-3">
            <EventBadge type={badge} />
          </div>
        )}

        {/* Category */}
        <div className="absolute top-3 left-3">
          <span className="inline-block bg-[#2E417B] dark:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-primary dark:text-slate-100 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-primary/70 dark:text-slate-400 mt-2 line-clamp-2">
          {typeof description === 'string' ? description.replace(/<[^>]*>?/gm, '') : description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 mt-4 text-sm text-primary/60 dark:text-slate-400">
          {/* Date & Time */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
            </svg>
            <span>
              {date} • {time}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Footer - Attendees & Price */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10 dark:border-slate-700">
          {attendees !== undefined && (
            <span className="text-xs text-primary/60 dark:text-slate-400">
              {attendees} peserta
            </span>
          )}
          {price !== undefined && (
            <span className="text-sm font-semibold text-[#2E417B] dark:text-blue-400">
              {price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`}
            </span>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/events/${id}`} className="block mt-4">
          <Button className="w-full rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700">
            Lihat Detail
          </Button>
        </Link>
      </div>
    </div>
  );
}
