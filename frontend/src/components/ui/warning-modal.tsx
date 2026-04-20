/**
 * Warning Modal component
 * Modal for warning/caution messages
 */

'use client';

import { BaseModal } from './modal';
import { Button } from './button';

type WarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  description?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showActions?: boolean;
};

export function WarningModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Understand',
  cancelText = 'Close',
  isLoading = false,
  showActions = true,
}: WarningModalProps) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
    >
      {/* Warning Icon & Message */}
      <div className="mb-6 flex gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-primary/80 dark:text-slate-300">
            {message}
          </p>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
            >
              {isLoading ? 'Loading...' : confirmText}
            </Button>
          )}
        </div>
      )}
    </BaseModal>
  );
}
