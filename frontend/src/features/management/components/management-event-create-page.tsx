'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { EventBannerField } from './event-banner-field';
import { CustomDropdown } from './custom-dropdown';
import { ManagementEventDatetimeInput } from './management-event-datetime-input';
import { useManagementEventCreate } from '../hooks/use-management-event-create';

export function ManagementEventCreatePage() {
  const { formState, formErrors, formSummaryErrors, setField, submit, isSubmitting, masterData, isMasterDataLoading } =
    useManagementEventCreate();
  const isOnlineMode = useMemo(() => {
    const selectedMode = masterData?.modes.find((mode) => mode.id === formState.modeId);
    return selectedMode?.slug?.toLowerCase() === 'online';
  }, [masterData?.modes, formState.modeId]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Create Event</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Buat event baru lewat halaman dedicated supaya input lebih nyaman.
          </p>
        </div>
        <Link
          href="/management/events"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          Back to Events
        </Link>
      </div>

      {isMasterDataLoading ? (
        <p className="text-sm text-slate-500">Loading form options...</p>
      ) : (
        <>
          {formSummaryErrors.length > 0 && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <p className="font-semibold">Please fix the following fields:</p>
              <ul className="mt-1 list-disc pl-5">
                {formSummaryErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <EventBannerField title={formState.title} value={formState.imageUrl} onChange={(nextValue) => setField('imageUrl', nextValue)} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formState.title}
                onChange={(event) => setField('title', event.target.value)}
                placeholder="Event title"
                className="h-auto rounded-lg border-slate-300 py-2 dark:border-slate-600 dark:bg-slate-800"
              />
              {formErrors.title && <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
              <RichTextEditor
                value={formState.description}
                onChange={(nextValue) => setField('description', nextValue)}
                placeholder="Describe your event details"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type <span className="text-rose-500">*</span>
              </label>
              <CustomDropdown
                value={formState.typeId}
                onChange={(value) => setField('typeId', value)}
                placeholder="Select type"
                options={(masterData?.types ?? []).map((row) => ({ value: row.id, label: row.name }))}
              />
              {formErrors.typeId && <p className="mt-1 text-xs text-red-600">{formErrors.typeId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mode <span className="text-rose-500">*</span>
              </label>
              <CustomDropdown
                value={formState.modeId}
                onChange={(value) => setField('modeId', value)}
                placeholder="Select mode"
                options={(masterData?.modes ?? []).map((row) => ({ value: row.id, label: row.name }))}
              />
              {formErrors.modeId && <p className="mt-1 text-xs text-red-600">{formErrors.modeId}</p>}
            </div>

            {isOnlineMode && (
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Meet Link <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="url"
                  value={formState.meetLink}
                  onChange={(event) => setField('meetLink', event.target.value)}
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="h-auto rounded-lg border-slate-300 py-2 dark:border-slate-600 dark:bg-slate-800"
                />
                {formErrors.meetLink && <p className="mt-1 text-xs text-red-600">{formErrors.meetLink}</p>}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Level</label>
              <CustomDropdown
                value={formState.levelId}
                onChange={(value) => setField('levelId', value)}
                placeholder="Select level"
                options={[
                  { value: '', label: 'No level' },
                  ...(masterData?.levels ?? []).map((row) => ({ value: row.id, label: row.name })),
                ]}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status <span className="text-rose-500">*</span>
              </label>
              <CustomDropdown
                value={formState.statusId}
                onChange={(value) => setField('statusId', value)}
                placeholder="Select status"
                options={(masterData?.eventStatuses ?? []).map((row) => ({ value: row.id, label: row.name }))}
              />
              {formErrors.statusId && <p className="mt-1 text-xs text-red-600">{formErrors.statusId}</p>}
            </div>

            <ManagementEventDatetimeInput
              label="Start At"
              value={formState.startAt}
              onChange={(nextValue) => setField('startAt', nextValue)}
            />

            <ManagementEventDatetimeInput
              label="End At"
              value={formState.endAt}
              onChange={(nextValue) => setField('endAt', nextValue)}
            />

            <ManagementEventDatetimeInput
              label="Registration Open"
              value={formState.registrationOpenAt}
              onChange={(nextValue) => setField('registrationOpenAt', nextValue)}
            />

            <ManagementEventDatetimeInput
              label="Registration Close"
              value={formState.registrationCloseAt}
              onChange={(nextValue) => setField('registrationCloseAt', nextValue)}
            />

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</label>
              <Input
                value={formState.timezone}
                onChange={(event) => setField('timezone', event.target.value)}
                className="h-auto rounded-lg border-slate-300 py-2 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Capacity</label>
              <Input
                type="number"
                min={1}
                value={formState.capacity}
                onChange={(event) => setField('capacity', event.target.value)}
                className="h-auto rounded-lg border-slate-300 py-2 dark:border-slate-600 dark:bg-slate-800"
              />
              {formErrors.capacity && <p className="mt-1 text-xs text-red-600">{formErrors.capacity}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Link
              href="/management/events"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="rounded-lg bg-[#2E417B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Create Event'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
