/**
 * Mentoring Filter Component
 * Filter mentors by level, expertise, hourly rate
 */

'use client';

import { useState } from 'react';

interface MentoringFilterProps {
  onFilter?: (filters: FilterState) => void;
}

interface FilterState {
  level: string | null;
  expertise: string[];
  minRate: number;
  maxRate: number;
  searchQuery: string;
}

const levels = ['Semua Level', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const expertiseOptions = ['JavaScript', 'React', 'TypeScript', 'Python', 'Data Science', 'UI/UX', 'Project Management'];

export function MentoringFilter({ onFilter }: MentoringFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    level: null,
    expertise: [],
    minRate: 0,
    maxRate: 1000000,
    searchQuery: '',
  });

  const handleLevelChange = (level: string) => {
    const newFilters = { ...filters, level: level === 'Semua Level' ? null : level };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleExpertiseToggle = (exp: string) => {
    const expertise = filters.expertise.includes(exp)
      ? filters.expertise.filter((e) => e !== exp)
      : [...filters.expertise, exp];
    const newFilters = { ...filters, expertise };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseInt(e.target.value);
    const newFilters = {
      ...filters,
      [type === 'min' ? 'minRate' : 'maxRate']: value,
    };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSearchChange = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="space-y-6 rounded-xl border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-2">
          Cari Mentor
        </label>
        <input
          type="text"
          placeholder="Nama mentor..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-lg border border-primary/20 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-primary dark:text-slate-100 placeholder-primary/40 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50 dark:focus:border-blue-500"
        />
      </div>

      {/* Level Filter */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Pengalaman Mentor
        </label>
        <div className="space-y-2">
          {levels.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="level"
                checked={(level === 'Semua Level' && !filters.level) || filters.level === level}
                onChange={() => handleLevelChange(level)}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Expertise Filter */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Keahlian
        </label>
        <div className="space-y-2">
          {expertiseOptions.map((exp) => (
            <label key={exp} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.expertise.includes(exp)}
                onChange={() => handleExpertiseToggle(exp)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-primary dark:text-slate-300">{exp}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Tarif Per Jam
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-primary/60 dark:text-slate-400">
              Min: Rp {filters.minRate.toLocaleString('id-ID')}
            </label>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={filters.minRate}
              onChange={(e) => handleRateChange(e, 'min')}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-primary/60 dark:text-slate-400">
              Max: Rp {filters.maxRate.toLocaleString('id-ID')}
            </label>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={filters.maxRate}
              onChange={(e) => handleRateChange(e, 'max')}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setFilters({ level: null, expertise: [], minRate: 0, maxRate: 1000000, searchQuery: '' });
          onFilter?.({ level: null, expertise: [], minRate: 0, maxRate: 1000000, searchQuery: '' });
        }}
        className="w-full px-4 py-2 text-sm font-medium text-primary dark:text-blue-400 border border-primary/20 dark:border-slate-600 rounded-lg hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors"
      >
        Reset Filter
      </button>
    </div>
  );
}
