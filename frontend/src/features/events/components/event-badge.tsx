/**
 * Event Badge Component
 * Shows status badges like "Live", "Upcoming", "Free", "Paid"
 */

type BadgeType = 'live' | 'upcoming' | 'free' | 'paid' | 'featured';

interface EventBadgeProps {
  type: BadgeType;
  label?: string;
}

const badgeStyles: Record<BadgeType, { bg: string; text: string }> = {
  live: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  upcoming: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  free: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  paid: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
  featured: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

const defaultLabels: Record<BadgeType, string> = {
  live: '🔴 Live',
  upcoming: '📅 Upcoming',
  free: '✨ Free',
  paid: '💳 Paid',
  featured: '⭐ Featured',
};

export function EventBadge({ type, label }: EventBadgeProps) {
  const style = badgeStyles[type];
  const displayLabel = label || defaultLabels[type];

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
      {displayLabel}
    </span>
  );
}
