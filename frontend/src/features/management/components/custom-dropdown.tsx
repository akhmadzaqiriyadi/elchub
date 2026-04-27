'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type DropdownOption = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  value: string;
  onChange: (nextValue: string) => void;
  options: DropdownOption[];
  placeholder: string;
  className?: string;
};

export function CustomDropdown({ value, onChange, options, placeholder, className }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const active = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border border-slate-300 px-3 py-2 text-left text-sm',
          'bg-white text-slate-700 transition hover:border-slate-400',
          'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
        )}
      >
        <span className={cn(!active && 'text-slate-500 dark:text-slate-400')}>{active?.label ?? placeholder}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition',
                option.value === value
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
