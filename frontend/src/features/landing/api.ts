import { apiRequest } from '@/lib/api-client';

import type { Event } from './types/event';

type PublicEventListItem = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  meetLink: string | null;
  startAt: string | null;
  endAt: string | null;
  registrationOpenAt: string | null;
  registrationCloseAt: string | null;
  timezone: string | null;
  capacity: number | null;
  type: {
    name: string;
    slug: string;
  };
  mode: {
    name: string;
    slug: string;
  };
  level: {
    id: string;
    name: string;
    slug: string;
  } | null;
  status: {
    code: string;
    name: string;
  };
  organizer: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

type PublicEventHighlightsPayload = {
  success: true;
  data: {
    items: PublicEventListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapEventType(slug: string): Event['type'] {
  if (slug === 'workshop') return 'workshop';
  if (slug === 'mentoring-session') return 'mentoring';
  if (slug === 'library') return 'library';
  return 'webinar';
}

function mapEventStatus(item: PublicEventListItem): Event['status'] {
  const now = new Date();
  const startAt = item.startAt ? new Date(item.startAt) : null;
  const endAt = item.endAt ? new Date(item.endAt) : null;

  if (endAt && !Number.isNaN(endAt.getTime()) && endAt < now) {
    return 'completed';
  }

  if (startAt && endAt && startAt <= now && now <= endAt) {
    return 'live';
  }

  return 'upcoming';
}

function formatDate(value: string | null) {
  if (!value) return 'Segera';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Segera';

  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeRange(startAt: string | null, endAt: string | null) {
  if (!startAt) return 'TBA';

  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return 'TBA';

  const startTime = start.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (!endAt) {
    return `${startTime} WIB`;
  }

  const end = new Date(endAt);
  if (Number.isNaN(end.getTime())) {
    return `${startTime} WIB`;
  }

  const endTime = end.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${startTime} - ${endTime} WIB`;
}

function mapPublicEventToLandingEvent(item: PublicEventListItem): Event {
  const type = mapEventType(item.type.slug);
  const description = stripHtml(item.description ?? '');

  return {
    id: item.id,
    title: item.title,
    description: description || item.title,
    type,
    status: mapEventStatus(item),
    isFree: false,
    isExclusive: type === 'mentoring',
    image: item.image ?? undefined,
    date: formatDate(item.startAt ?? item.createdAt),
    time: formatTimeRange(item.startAt, item.endAt),
    instructor: item.organizer.name ?? item.organizer.email,
  };
}

export async function getLandingEventHighlights() {
  const response = await apiRequest<PublicEventHighlightsPayload>('/events/highlights', {
    method: 'GET',
  });

  return response.data.items.map(mapPublicEventToLandingEvent);
}
