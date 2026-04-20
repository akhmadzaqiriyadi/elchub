/**
 * Base Modal component
 * Atomic component for displaying modal dialogs
 */

import { cn } from '@/lib/utils';

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  backdrop?: boolean;
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  backdrop = true,
}: BaseModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div
          className="fixed top-0 left-0 w-screen h-screen z-40 bg-black/50 backdrop-blur-sm dark:bg-black/70 overflow-hidden"
          onClick={onClose}
        />
      )}

      {/* Modal Container - Absolute positioned center */}
      <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl border border-primary/15 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 pointer-events-auto',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-primary/15 px-6 py-4 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-primary dark:text-slate-100">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </>
  );
}
