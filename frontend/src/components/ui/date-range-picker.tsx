'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value?: {
    from?: Date;
    to?: Date;
  };
  onChange?: (range: { from?: Date; to?: Date }) => void;
  placeholder?: string;
  className?: string;
}

function formatDate(value?: Date) {
  return value ? format(value, 'dd MMM yyyy') : 'Select date';
}

export function DateRangePicker({ value, onChange, placeholder = 'Date range', className }: DateRangePickerProps) {
  const [from, setFrom] = useState<Date | undefined>(value?.from);
  const [to, setTo] = useState<Date | undefined>(value?.to);

  useEffect(() => {
    setFrom(value?.from);
    setTo(value?.to);
  }, [value?.from, value?.to]);

  const previewLabel = useMemo(() => {
    if (from && to) {
      return `${formatDate(from)} - ${formatDate(to)}`;
    }

    if (from) {
      return `${formatDate(from)} - End date`;
    }

    if (to) {
      return `Start date - ${formatDate(to)}`;
    }

    return 'No range selected';
  }, [from, to]);

  const handleFromChange = (nextValue: string) => {
    const nextFrom = nextValue ? new Date(`${nextValue}T00:00:00`) : undefined;
    setFrom(nextFrom);
    onChange?.({ from: nextFrom, to });
  };

  const handleToChange = (nextValue: string) => {
    const nextTo = nextValue ? new Date(`${nextValue}T00:00:00`) : undefined;
    setTo(nextTo);
    onChange?.({ from, to: nextTo });
  };

  const handleClear = () => {
    setFrom(undefined);
    setTo(undefined);
    onChange?.({ from: undefined, to: undefined });
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-900',
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{placeholder}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{previewLabel}</p>
        </div>

        <Button variant="secondary" size="default" onClick={handleClear} className="h-9 px-3 text-xs">
          Clear
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">From</span>
          <input
            aria-label="From date"
            type="date"
            value={from ? format(from, 'yyyy-MM-dd') : ''}
            onChange={(e) => handleFromChange(e.target.value)}
            className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#2E417B] focus:ring-2 focus:ring-[#2E417B]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/40"
          />
        </label>

        <div className="hidden items-center justify-center text-slate-400 sm:flex">to</div>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">To</span>
          <input
            aria-label="To date"
            type="date"
            value={to ? format(to, 'yyyy-MM-dd') : ''}
            onChange={(e) => handleToChange(e.target.value)}
            className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#2E417B] focus:ring-2 focus:ring-[#2E417B]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/40"
          />
        </label>
      </div>
    </div>
  );
}
