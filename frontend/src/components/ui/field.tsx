import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

type FieldErrorProps = {
  message?: string | null;
};

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-rose-600">{message}</p>;
}