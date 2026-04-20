/**
 * Agree Modal component
 * Modal for positive confirmations (agree, accept, confirm actions)
 */

'use client';

import { BaseModal } from './modal';
import { Button } from './button';

type AgreeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void | Promise<void>;
  title: string;
  description?: string;
  message: string;
  agreeText?: string;
  declineText?: string;
  isLoading?: boolean;
};

export function AgreeModal({
  isOpen,
  onClose,
  onAgree,
  title,
  description,
  message,
  agreeText = 'Agree',
  declineText = 'Cancel',
  isLoading = false,
}: AgreeModalProps) {
  const handleAgree = async () => {
    await onAgree();
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
          {declineText}
        </Button>
        <Button
          onClick={handleAgree}
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
        >
          {isLoading ? 'Loading...' : agreeText}
        </Button>
      </div>
    </BaseModal>
  );
}
