/**
 * Event Filter Component
 * Filter events by category, type, date
 */

'use client';

import { useState } from 'react';

interface EventFilterProps {
  onFilter?: (filters: FilterState) => void;
}

interface FilterState {
  category: string | null;
  type: string | null;
  searchQuery: string;
}

const categories = ['Semua', 'Webinar', 'Workshop', 'Mentoring', 'Hackathon', 'Networking'];
const types = ['Semua', 'Online', 'Offline', 'Hybrid'];

export function EventFilter({ onFilter }: EventFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    type: null,
    searchQuery: '',
  });

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category: category === 'Semua' ? null : category };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleTypeChange = (type: string) => {
    const newFilters = { ...filters, type: type === 'Semua' ? null : type };
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
          Cari Event
        </label>
        <input
          type="text"
          placeholder="Cari nama event..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-lg border border-primary/20 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-primary dark:text-slate-100 placeholder-primary/40 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50 dark:focus:border-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Kategori
        </label>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category}
                checked={
                  (category === 'Semua' && !filters.category) ||
                  filters.category === category
                }
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Format
        </label>
        <div className="space-y-2">
          {types.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type}
                checked={
                  (type === 'Semua' && !filters.type) ||
                  filters.type === type
                }
                onChange={() => handleTypeChange(type)}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setFilters({ category: null, type: null, searchQuery: '' });
          onFilter?.({ category: null, type: null, searchQuery: '' });
        }}
        className="w-full px-4 py-2 text-sm font-medium text-primary dark:text-blue-400 border border-primary/20 dark:border-slate-600 rounded-lg hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors"
      >
        Reset Filter
      </button>
    </div>
  );
}
