export type EventType = 'webinar' | 'workshop' | 'mentoring' | 'library';

export type EventStatus = 'live' | 'upcoming' | 'completed';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  isFree: boolean;
  isExclusive: boolean;
  image?: string;
  date: string;
  time?: string;
  instructor?: string;
  participants?: number;
  price?: number | null;
}
