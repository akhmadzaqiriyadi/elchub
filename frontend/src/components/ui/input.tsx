import * as React from 'react';

import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm text-primary outline-none transition-colors placeholder:text-primary/55 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500 dark:focus:ring-slate-700/60 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary dark:file:text-slate-100 file:pt-2',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';