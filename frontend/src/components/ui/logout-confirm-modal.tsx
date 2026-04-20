/**
 * Logout Confirm Modal component
 * Modal to confirm user logout action
 */

'use client';

import { BaseModal } from './modal';
import { Button } from './button';

type LogoutConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  userName?: string;
};

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userName = 'User',
}: LogoutConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Logout Confirmation"
      description="Confirm your action"
    >
      {/* Warning Icon & Message */}
      <div className="mb-6 flex gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-primary/80 dark:text-slate-300">
            Apakah kamu yakin ingin logout, <span className="font-medium">{userName}</span>?
          </p>
          <p className="mt-2 text-xs text-primary/60 dark:text-slate-400">
            Anda akan keluar dari akun dan perlu login ulang untuk mengakses fitur.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
        >
          {isLoading ? 'Logging out...' : 'Yes, Logout'}
        </Button>
      </div>
    </BaseModal>
  );
}
