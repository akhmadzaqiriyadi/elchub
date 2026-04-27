'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

type ManagementEventDatetimeInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function splitDateAndTime(value: string) {
  if (!value) {
    return { date: '', time: '' };
  }

  const [datePart, timePart = ''] = value.split('T');
  return {
    date: datePart ?? '',
    time: timePart.slice(0, 5),
  };
}

function parseDate(value: string) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

export function ManagementEventDatetimeInput({ label, value, onChange }: ManagementEventDatetimeInputProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { date, time } = useMemo(() => splitDateAndTime(value), [value]);
  const selectedDate = useMemo(() => parseDate(date), [date]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsCalendarOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleTimeChange = (nextTime: string) => {
    if (!date) {
      return;
    }

    onChange(`${date}T${nextTime || '00:00'}`);
  };

  const handleSelectDate = (nextDate: Date | undefined) => {
    if (!nextDate) {
      onChange('');
      return;
    }

    const formattedDate = format(nextDate, 'yyyy-MM-dd');
    onChange(`${formattedDate}T${time || '00:00'}`);
    setIsCalendarOpen(false);
  };

  return (
    <div ref={rootRef}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <div className="grid grid-cols-[1fr_130px_auto] gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((current) => !current)}
            className="flex h-full w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <span>{selectedDate ? format(selectedDate, 'dd MMM yyyy') : 'Select date'}</span>
            <CalendarIcon className="h-4 w-4 text-slate-500" />
          </button>

          {isCalendarOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-30 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                className="text-sm"
              />
            </div>
          )}
        </div>
        <div className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800">
          <TimePicker
            onChange={(nextValue: string | null) => {
              if (typeof nextValue !== 'string') return;
              handleTimeChange(nextValue);
            }}
            value={time || null}
            disableClock
            clearIcon={null}
            format="HH:mm"
            hourPlaceholder="HH"
            minutePlaceholder="MM"
            disabled={!date}
            className="management-time-picker"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            onChange('');
            setIsCalendarOpen(false);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
