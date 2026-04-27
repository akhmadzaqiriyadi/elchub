'use client';

import type { UserListItem } from '../types';

interface UserDeleteConfirmModalProps {
  isOpen: boolean;
  user: UserListItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserDeleteConfirmModal({
  isOpen,
  user,
  onConfirm,
  onCancel,
  isLoading = false,
}: UserDeleteConfirmModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Delete User
        </h3>

        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to delete this user?
        </p>

        <p className="mb-6 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          <strong>Email:</strong> {user.email}
          {user.name && (
            <>
              <br />
              <strong>Name:</strong> {user.name}
            </>
          )}
        </p>

        <p className="mb-6 text-xs text-red-600 dark:text-red-400">
          ⚠️ This action cannot be undone. The user account will be permanently deleted from the system.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
