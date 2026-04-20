/**
 * Footer footnote component
 * Bottom section with copyright and verification message
 */

import { cn } from '@/lib/utils';

interface FooterFootnoteProps {
  copyright: string;
  verificationMessage: string;
  className?: string;
}

export function FooterFootnote({
  copyright,
  verificationMessage,
  className,
}: FooterFootnoteProps) {
  return (
    <div
      className={cn(
        'border-t border-slate-200 dark:border-slate-800 pt-6 mt-6',
        className,
      )}
    >
      {/* Verification Message */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
        {verificationMessage}
      </p>

      {/* Copyright */}
      <p className="text-xs text-slate-600 dark:text-slate-500 text-center">
        {copyright}
      </p>
    </div>
  );
}
