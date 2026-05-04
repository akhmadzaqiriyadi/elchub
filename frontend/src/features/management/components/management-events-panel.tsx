'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { useManagementEvents } from '../hooks/use-management-events';
import { CustomDropdown } from './custom-dropdown';
import { Pagination } from '@/components/ui/pagination';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useManagementEventCrud } from '../hooks/use-management-event-crud';
import { WarningModal } from '@/components/ui/warning-modal';

function getStatusBadgeClass(statusCode: string) {
  const normalized = statusCode.toUpperCase();

  if (normalized === 'PUBLISHED' || normalized === 'OPEN') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  }

  if (normalized === 'DRAFT') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  }

  if (normalized === 'CLOSED' || normalized === 'COMPLETED') {
    return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }

  if (normalized === 'CANCELLED') {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
  }

  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
}

export function ManagementEventsPanel() {
  const {
    searchInput,
    setSearchInput,
    typeSlug,
    setTypeSlug,
    modeSlug,
    setModeSlug,
    statusCode,
    setStatusCode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    dateRange,
    setDateRange,
    page,
    setPage,
    eventsQuery,
    masterDataQuery,
  } = useManagementEvents();

  const items = eventsQuery.data?.data.items ?? [];
  const pagination = eventsQuery.data?.data.pagination;
  const masterData = masterDataQuery.data?.data;

  const eventCrud = useManagementEventCrud();
  const summary = useMemo(() => {
    const total = pagination?.total ?? items.length;
    const published = items.filter((item) => item.status.code.toUpperCase() === 'PUBLISHED').length;
    const draft = items.filter((item) => item.status.code.toUpperCase() === 'DRAFT').length;
    const closed = items.filter((item) => item.status.code.toUpperCase() === 'CLOSED').length;

    return { total, published, draft, closed };
  }, [items, pagination?.total]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Event Management</h2>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <input
            value={searchInput}
            onChange={(event) => {
              setPage(1);
              setSearchInput(event.target.value);
            }}
            placeholder="Search event title..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-64 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <Link
            href="/management/events/create"
            className="rounded-lg bg-[#2E417B] px-3 py-2 text-sm font-semibold text-white"
          >
            Create Event
          </Link>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4 items-start">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Events</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Published (current page)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{summary.published}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Draft (current page)</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700 dark:text-amber-300">{summary.draft}</p>
        </div>
        <div className="rounded-xl border border-slate-300 bg-slate-100 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">Closed (current page)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-200">{summary.closed}</p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-5 md:items-end">
        <CustomDropdown
          value={typeSlug}
          onChange={(nextValue) => {
            setPage(1);
            setTypeSlug(nextValue);
          }}
          placeholder="All Types"
          options={[
            { value: '', label: 'All Types' },
            ...(masterDataQuery.data?.data.types ?? []).map((type) => ({
              value: type.slug ?? '',
              label: type.name,
            })),
          ]}
        />

        <CustomDropdown
          value={modeSlug}
          onChange={(nextValue) => {
            setPage(1);
            setModeSlug(nextValue);
          }}
          placeholder="All Modes"
          options={[
            { value: '', label: 'All Modes' },
            ...(masterDataQuery.data?.data.modes ?? []).map((mode) => ({
              value: mode.slug ?? '',
              label: mode.name,
            })),
          ]}
        />

        <CustomDropdown
          value={statusCode}
          onChange={(nextValue) => {
            setPage(1);
            setStatusCode(nextValue);
          }}
          placeholder="All Statuses"
          options={[
            { value: '', label: 'All Statuses' },
            ...(masterDataQuery.data?.data.eventStatuses ?? []).map((status) => ({
              value: status.code ?? '',
              label: status.name,
            })),
          ]}
        />
      </div>

      {/* Sorting and Date Filter */}
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1">
            Sort By
          </label>
          <CustomDropdown
            value={sortBy}
            onChange={(nextValue) => {
              setPage(1);
              setSortBy(nextValue as 'createdAt' | 'startAt' | 'endAt' | 'title');
            }}
            placeholder="Sort By"
            options={[
              { value: 'createdAt', label: 'Created Date' },
              { value: 'startAt', label: 'Start Date' },
              { value: 'endAt', label: 'End Date' },
              { value: 'title', label: 'Title' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1">
            Order
          </label>
          <CustomDropdown
            value={sortOrder}
            onChange={(nextValue) => {
              setPage(1);
              setSortOrder(nextValue as 'asc' | 'desc');
            }}
            placeholder="Order"
            options={[
              { value: 'desc', label: 'Newest First' },
              { value: 'asc', label: 'Oldest First' },
            ]}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1">
            Date Range
          </label>
          <DateRangePicker
            value={dateRange}
            onChange={(range: { from?: Date; to?: Date }) => {
              setPage(1);
              setDateRange(range);
            }}
            placeholder="Select date range"
            className="w-full"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setPage(1);
              setSortBy('createdAt');
              setSortOrder('desc');
              setDateRange({});
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {eventsQuery.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-5 text-sm text-slate-500">
                  Loading events...
                </td>
              </tr>
            )}
            {!eventsQuery.isLoading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-5 text-sm text-slate-500">
                  No events found.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{item.title}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{item.type.name}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{item.mode.name}</td>
                <td className="px-4 py-3 text-sm">
                  {item.isFree ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Gratis</span>
                  ) : (
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {typeof item.price === 'number'
                        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)
                        : 'Berbayar'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(item.status.code)}`}>
                    {item.status.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/management/events/${item.id}`}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      View
                    </Link>
                    <Link
                      href={`/management/events/${item.id}/edit`}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => eventCrud.requestDelete(item.id, item.title)}
                      disabled={eventCrud.isRowDeleting(item.id)}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {eventCrud.isRowDeleting(item.id) ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pagination?.page ?? page}
        limit={pagination?.limit ?? 10}
        total={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 1}
        isLoading={eventsQuery.isFetching}
        onPageChange={setPage}
      />

      <WarningModal
        isOpen={Boolean(eventCrud.deleteTarget)}
        onClose={eventCrud.cancelDelete}
        onConfirm={eventCrud.confirmDelete}
        title="Delete Event"
        description="This action cannot be undone"
        message={`Are you sure you want to delete ${eventCrud.deleteTarget?.title ?? 'this event'}?`}
        confirmText={eventCrud.isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isLoading={eventCrud.isDeleting}
      />
    </section>
  );
}
