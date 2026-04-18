import type { LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <label className={cn('text-sm font-medium text-slate-800 dark:text-slate-200', className)} {...props}>
      <span>{children}</span>
      {required ? (
        <>
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only">required</span>
        </>
      ) : null}
    </label>
  );
}