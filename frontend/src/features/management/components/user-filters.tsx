'use client';

import type { UserRole } from '../types';

interface UserFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedRole: UserRole | undefined;
  onRoleChange: (role: UserRole | undefined) => void;
  selectedStatus: boolean | undefined;
  onStatusChange: (status: boolean | undefined) => void;
  onResetFilters: () => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'USER', label: 'Regular User' },
  { value: 'ORGANIZER', label: 'Event Organizer' },
  { value: 'MENTOR', label: 'Community Mentor' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

export function UserFilters({
  searchInput,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
}: UserFiltersProps) {
  const hasFilters = searchInput || selectedRole || selectedStatus !== undefined;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {/* Search Field */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Search
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Role
          </label>
          <select
            value={selectedRole || ''}
            onChange={(e) => onRoleChange((e.target.value as UserRole) || undefined)}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>
          <select
            value={selectedStatus !== undefined ? String(selectedStatus) : ''}
            onChange={(e) => {
              const value = e.target.value;
              onStatusChange(value === '' ? undefined : value === 'true');
            }}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
