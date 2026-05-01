'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-context';
import { Input } from '@/components/ui/input';
import { getManagementEventById } from '../api';

function formatDateTime(value: string | null) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('id-ID');
}

export function ManagementEventViewPage({ eventId }: { eventId: string }) {
  const { token } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['management', 'events', 'detail', eventId, token],
    queryFn: () => getManagementEventById(eventId, token),
    enabled: Boolean(token && eventId),
  });

  const event = data?.data;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Event Detail</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Detail informasi event.
          </p>
        </div>
        <Link
          href="/management/events"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          Back to Events
        </Link>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">Failed to load event data.</p>}
      
      {!isLoading && !error && !event && (
        <p className="text-sm text-slate-500">No event found.</p>
      )}

      {event && (
        <div className="grid gap-4 md:grid-cols-2">
          {event.image && (
            <div className="md:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <img src={event.image} alt={event.title} className="h-72 w-full object-cover sm:h-96" />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Title</label>
            <Input readOnly value={event.title} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</label>
            <Input readOnly value={event.slug} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Organizer</label>
            <Input readOnly value={event.organizer.name ?? event.organizer.email} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
            <Input readOnly value={event.type.name} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</label>
            <Input readOnly value={event.mode.name} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Level</label>
            <Input readOnly value={event.level?.name ?? '-'} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
            <Input readOnly value={event.status.name} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Meet Link</label>
            {event.meetLink ? (
              <a href={event.meetLink} target="_blank" rel="noreferrer" className="block w-full h-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-blue-600 underline dark:border-slate-600 dark:bg-slate-800">
                {event.meetLink}
              </a>
            ) : (
              <Input readOnly value="-" className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Start At</label>
            <Input readOnly value={formatDateTime(event.startAt)} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">End At</label>
            <Input readOnly value={formatDateTime(event.endAt)} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Registration Open</label>
            <Input readOnly value={formatDateTime(event.registrationOpenAt)} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Registration Close</label>
            <Input readOnly value={formatDateTime(event.registrationCloseAt)} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</label>
            <Input readOnly value={event.timezone ?? '-'} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Capacity</label>
            <Input readOnly value={typeof event.capacity === 'number' ? String(event.capacity) : '-'} className="h-auto rounded-lg border-slate-300 bg-slate-50 py-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
            {event.description ? (
              <div
                className="prose prose-sm mt-1 max-w-none rounded-lg border border-slate-300 bg-slate-50 p-3 dark:prose-invert dark:border-slate-600 dark:bg-slate-800"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            ) : (
              <p className="mt-1 rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-600 dark:bg-slate-800">-</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
