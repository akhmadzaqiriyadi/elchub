'use client';

import React, { useState } from 'react';
import { DayPicker, DateRange as DayPickerDateRange } from 'react-day-picker';
import { format, addMonths } from 'date-fns';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

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
  const [range, setRange] = useState<DayPickerDateRange | undefined>(
    value?.from && value?.to
      ? { from: value.from, to: value.to }
      : value?.from
        ? { from: value.from, to: value.from }
        : undefined,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());

  const handleSelect = (selectedRange: DayPickerDateRange | undefined) => {
    setRange(selectedRange);
    // Only trigger onChange and close when BOTH dates are selected
    if (selectedRange?.from && selectedRange?.to) {
      onChange?.(selectedRange);
      // Keep popover open for now, user will click Done button
    }
  };

  const formatDate = (date: Date | undefined) => (date ? format(date, 'dd MMM yyyy') : '');

  const displayText =
    range?.from && range?.to
      ? `${formatDate(range.from)} - ${formatDate(range.to)}`
      : range?.from
        ? `From ${formatDate(range.from)}`
        : placeholder;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            'flex w-full items-center justify-between rounded-xl border border-slate-300 px-3 py-2 text-left text-sm',
            'bg-white text-slate-700 transition hover:border-slate-400',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
            className,
          )}
        >
          <span className={cn('text-sm', !range?.from && 'text-slate-500 dark:text-slate-400')}>
            {displayText}
          </span>
          <svg className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        sideOffset={6}
        className="z-50 w-[288px] rounded-xl border border-slate-200 bg-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-950 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed"
      >
        <div className="p-3 pb-3 overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setMonth(addMonths(month, -1))}
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 text-center text-slate-300 text-xs font-semibold">
              {format(month, 'MMMM yyyy')}
            </div>
            <button
              onClick={() => setMonth(addMonths(month, 1))}
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <style>{`
            .rdp {
              --rdp-cell-size: 32px;
              --rdp-accent-color: #ffffff;
              --rdp-background-color: transparent;
              color: #e2e8f0;
            }
            
            .rdp-months {
              display: block;
            }
            
            .rdp-month {
              width: 100%;
            }
            
            .rdp-caption {
              display: none;
            }
            
            .rdp-head_cell {
              color: #94a3b8;
              font-weight: 600;
              font-size: 0.7rem;
              padding: 0.2rem;
            }
            
            .rdp-table {
              border-spacing: 0 2px;
              width: 100%;
              padding: 0 2px;
            }
            
            .rdp-row {
              gap: 0px;
            }
            
            .rdp-cell {
              padding: 0px;
              text-align: center;
            }
            
            .rdp-day {
              border-radius: 0;
              font-weight: 500;
              font-size: 0.8rem;
              color: #cbd5e1;
              transition: all 0.2s;
              height: 32px;
              width: 32px;
              margin: 0;
            }
            
            .rdp-day_today:not([disabled]) {
              color: #ffffff;
              background-color: #ffffff;
              font-weight: 600;
            }
            
            .rdp-day_selected:not([disabled]) {
              background-color: #ffffff;
              color: #1e293b;
              font-weight: 600;
            }
            
            .rdp-day_range_start:not([disabled]) {
              background-color: rgba(37, 99, 235, 0.9);
              color: #ffffff;
              border-radius: 0.375rem 0 0 0.375rem;
              border: 1px solid #1d4ed8;
              border-right: none;
              font-weight: 600;
              z-index: 1;
            }
            
            .rdp-day_range_middle:not([disabled]) {
              background-color: rgba(59, 130, 246, 0.5);
              color: #ffffff;
              border-radius: 0;
              margin-left: -1px;
              margin-right: -1px;
              font-weight: 600;
              border-top: 1px solid rgba(37, 99, 235, 0.9);
              border-bottom: 1px solid rgba(37, 99, 235, 0.9);
              border-left: 1px solid rgba(37, 99, 235, 0.9);
              border-right: 1px solid rgba(37, 99, 235, 0.9);
            }
            
            .rdp-day_range_end:not([disabled]) {
              background-color: rgba(37, 99, 235, 0.9);
              color: #ffffff;
              border-radius: 0 0.375rem 0.375rem 0;
              border: 1px solid #1d4ed8;
              border-left: none;
              font-weight: 600;
              z-index: 1;
            }
            
            .rdp-day_outside {
              color: #64748b;
              opacity: 0.4;
            }
            
            .rdp-day_disabled {
              color: #475569;
              opacity: 0.4;
            }
            
            .rdp-day:hover:not([disabled]) {
              background-color: #475569;
            }
            
            .rdp-tbody {
              margin: 0;
              padding: 0;
            }
            
            .rdp tbody tr:last-child td {
              padding-bottom: 0;
            }
          `}</style>

          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            disabled={(date) => date > new Date()}
            month={month}
            onMonthChange={setMonth}
            numberOfMonths={1}
            showOutsideDays={true}
          />
        </div>

        {/* Footer with actions */}
        <div className="border-t border-slate-700 bg-slate-800 px-3 py-2 flex justify-end gap-2">
          <button
            onClick={() => {
              setRange(undefined);
              onChange?.({ from: undefined, to: undefined });
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 rounded-lg transition-all"
          >
            Clear
          </button>
          <button
            onClick={() => {
              if (range?.from && range?.to) {
                onChange?.(range);
              }
              setIsOpen(false);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-slate-600 text-white hover:bg-slate-500 rounded-lg transition-all"
          >
            Done
          </button>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
