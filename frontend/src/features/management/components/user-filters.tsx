'use client';

import { CustomDropdown } from './custom-dropdown';
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
    <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-4 dark:border-slate-700">
      {/* Search Field */}
      <div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Role Filter */}
      <CustomDropdown
        value={selectedRole || ''}
        onChange={(value) => onRoleChange((value as UserRole) || undefined)}
        placeholder="All Roles"
        options={[
          { value: '', label: 'All Roles' },
          ...ROLE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
        ]}
      />

      {/* Status Filter */}
      <CustomDropdown
        value={selectedStatus !== undefined ? String(selectedStatus) : ''}
        onChange={(value) => {
          onStatusChange(value === '' ? undefined : value === 'true');
        }}
        placeholder="All Status"
        options={[
          { value: '', label: 'All Status' },
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ]}
      />

      {/* Reset Button */}
      {hasFilters && (
        <button
          onClick={onResetFilters}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
