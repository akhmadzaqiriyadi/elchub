/**
 * Decline Modal component
 * Modal for negative actions or refusals
 */

'use client';

import { BaseModal } from './modal';
import { Button } from './button';

type DeclineModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDecline: () => void | Promise<void>;
  title: string;
  description?: string;
  message: string;
  declineText?: string;
  cancelText?: string;
  isLoading?: boolean;
};

export function DeclineModal({
  isOpen,
  onClose,
  onDecline,
  title,
  description,
  message,
  declineText = 'Decline',
  cancelText = 'Cancel',
  isLoading = false,
}: DeclineModalProps) {
  const handleDecline = async () => {
    await onDecline();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
    >
      {/* Message */}
      <p className="mb-6 text-sm text-primary/80 dark:text-slate-300">
        {message}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleDecline}
          disabled={isLoading}
          className="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
        >
          {isLoading ? 'Loading...' : declineText}
        </Button>
      </div>
    </BaseModal>
  );
}
