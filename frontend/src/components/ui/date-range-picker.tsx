'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
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

export function DateRangePicker({ value, onChange, placeholder = 'Select date range', className }: DateRangePickerProps) {
  const [from, setFrom] = useState<Date | undefined>(value?.from);
  const [to, setTo] = useState<Date | undefined>(value?.to);

  useEffect(() => {
    setFrom(value?.from);
    setTo(value?.to);
  }, [value]);

  useEffect(() => {
    onChange?.({ from, to });
  }, [from, to]);

  return (
    <div className={cn('flex w-full min-w-0 items-center gap-2', className)}>
      <input
        aria-label="From date"
        type="date"
        value={from ? format(from, 'yyyy-MM-dd') : ''}
        onChange={(e) => setFrom(e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined)}
        placeholder="From"
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />

      <span className="text-slate-400">—</span>

      <input
        aria-label="To date"
        type="date"
        value={to ? format(to, 'yyyy-MM-dd') : ''}
        onChange={(e) => setTo(e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined)}
        placeholder="To"
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />
    </div>
  );
}
