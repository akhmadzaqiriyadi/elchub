'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';

import type { UserListItem, UserRole } from '../types';

interface UserTableRowProps {
  user: UserListItem;
  onView: (user: UserListItem) => void;
  onEdit: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
}

function getRoleBadgeClass(role: UserRole) {
  const normalized = role.toUpperCase();

  if (normalized === 'ADMIN') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  }

  if (normalized === 'ORGANIZER') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  }

  if (normalized === 'MENTOR') {
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
  }

  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function getStatusBadgeClass(isActive: boolean) {
  return isActive
    ? 'inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    : 'inline-flex rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
}

export function UserTableRow({ user, onView, onEdit, onDelete }: UserTableRowProps) {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
      <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
        {user.name || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
        {user.email}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={getStatusBadgeClass(user.isActive)}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onView(user)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            onClick={() => onEdit(user)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(user)}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-600/40 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
