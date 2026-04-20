/**
 * Availability Slots Component
 * Shows available time slots for booking
 */

import { useState } from 'react';

interface TimeSlot {
  date: string;
  day: string;
  times: string[];
}

interface AvailabilitySlotsProps {
  slots: TimeSlot[];
  onSelectSlot?: (date: string, time: string) => void;
}

export function AvailabilitySlots({ slots, onSelectSlot }: AvailabilitySlotsProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

  const handleSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    onSelectSlot?.(date, time);
  };

  return (
    <div className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <h3 className="text-lg font-bold text-primary dark:text-slate-100 mb-4">
        Pilih Jadwal Tersedia
      </h3>

      <div className="space-y-4">
        {slots.map((slot) => (
          <div key={slot.date} className="pb-4 border-b border-primary/10 dark:border-slate-700 last:border-b-0 last:pb-0">
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-primary/70 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
              </svg>
              <span className="font-semibold text-primary dark:text-slate-100">
                {slot.day}, {slot.date}
              </span>
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slot.times.map((time) => (
                <button
                  key={time}
                  onClick={() => handleSelect(slot.date, time)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSlot?.date === slot.date && selectedSlot?.time === time
                      ? 'bg-[#2E417B] text-white dark:bg-blue-600'
                      : 'bg-primary/10 dark:bg-slate-700 text-primary dark:text-slate-300 hover:bg-primary/20 dark:hover:bg-slate-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Info */}
      {selectedSlot && (
        <div className="mt-4 pt-4 border-t border-primary/10 dark:border-slate-700">
          <p className="text-sm text-primary/70 dark:text-slate-400">
            Jadwal yang dipilih:{' '}
            <span className="font-semibold text-primary dark:text-slate-100">
              {selectedSlot.date} - {selectedSlot.time}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
