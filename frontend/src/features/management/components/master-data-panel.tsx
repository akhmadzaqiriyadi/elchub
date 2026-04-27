'use client';

import { CustomDropdown } from './custom-dropdown';
import { WarningModal } from '@/components/ui/warning-modal';
import { Pagination } from '@/components/ui/pagination';
import { useManagementMasterData } from '../hooks/use-management-master-data';
import type { MasterDataKind } from '../types';

const kindOptions: Array<{ value: MasterDataKind; label: string }> = [
  { value: 'types', label: 'Event Types' },
  { value: 'topics', label: 'Event Topics' },
  { value: 'modes', label: 'Event Modes' },
  { value: 'levels', label: 'Event Levels' },
  { value: 'statuses', label: 'Event Statuses' },
];

export function MasterDataPanel() {
  const {
    kind,
    setKind,
    isStatusKind,
    name,
    setName,
    slugOrCode,
    setSlugOrCode,
    sortOrder,
    setSortOrder,
    isActive,
    setIsActive,
    editingId,
    formErrors,
    isSubmitting,
    isRowUpdating,
    isRowDeleting,
    submitForm,
    searchInput,
    setSearchInput,
    page,
    setPage,
    limit,
    setLimit,
    isSearchDebouncing,
    pagination,
    rowsQuery,
    deleteMutation,
    startEdit,
    requestDelete,
    deleteTarget,
    confirmDelete,
    cancelDelete,
    resetForm,
  } = useManagementMasterData();

  const rows = rowsQuery.data?.data.items ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Master Data Management</h2>
        <div className="grid w-full gap-3 md:w-auto md:grid-cols-[220px_240px]">
          <CustomDropdown
            value={kind}
            onChange={(nextValue) => {
              setKind(nextValue as MasterDataKind);
              setPage(1);
              resetForm();
            }}
            placeholder="Select master kind"
            options={kindOptions}
          />
          <div>
            <input
              value={searchInput}
              onChange={(event) => {
                setPage(1);
                setSearchInput(event.target.value);
              }}
              placeholder="Search name, slug, code..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            {isSearchDebouncing && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Searching...</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-5 dark:border-slate-700">
        <div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
        </div>
        <div>
          <input
            value={slugOrCode}
            onChange={(event) => setSlugOrCode(event.target.value)}
            placeholder={isStatusKind ? 'Code (e.g DRAFT)' : 'Slug (e.g webinar)'}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {formErrors.slugOrCode && <p className="mt-1 text-xs text-red-600">{formErrors.slugOrCode}</p>}
        </div>
        <input
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          placeholder="Sort order"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={() => setIsActive((current) => !current)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          Active: {isActive ? 'Yes' : 'No'}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={submitForm}
            disabled={isSubmitting}
            className="rounded-lg bg-[#2E417B] px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Slug/Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Active</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {rowsQuery.isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-5 text-sm text-slate-500">
                  Loading master data...
                </td>
              </tr>
            )}
            {!rowsQuery.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-5 text-sm text-slate-500">
                  No data found.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.name}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.slug ?? row.code ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{row.sortOrder}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  <span
                    className={
                      row.isActive
                        ? 'inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'inline-flex rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    }
                  >
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      disabled={isSubmitting || isRowDeleting(row.id)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600"
                    >
                      {isRowUpdating(row.id) ? 'Updating...' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(row.id, row.name)}
                      disabled={isSubmitting || isRowUpdating(row.id) || isRowDeleting(row.id)}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRowDeleting(row.id) ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-300">Page size</span>
          <div className="w-24">
            <CustomDropdown
              value={String(limit)}
              onChange={(nextValue) => {
                setPage(1);
                setLimit(Number(nextValue));
              }}
              placeholder="Limit"
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
              ]}
            />
          </div>
        </div>

        <Pagination
          page={pagination?.page ?? page}
          limit={pagination?.limit ?? limit}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 1}
          isLoading={rowsQuery.isFetching}
          onPageChange={setPage}
        />
      </div>

      <WarningModal
        isOpen={Boolean(deleteTarget)}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Master Data"
        description="This action cannot be undone"
        message={`Are you sure you want to delete ${deleteTarget?.name ?? 'this item'}?`}
        confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
      />
    </section>
  );
}
