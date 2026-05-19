/**
 * Event Filter Component
 * Filter events by category, type, level, price, date, and sorting
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CustomDropdown } from '@/features/management/components/custom-dropdown';

interface EventFilterProps {
  onFilter?: (filters: FilterState) => void;
}

interface FilterState {
  category: string | null;
  type: string | null;
  level: string | null;
  searchQuery: string;
  isFree: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  startDate: string | null;
  endDate: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const categories = ['Semua', 'Webinar', 'Workshop', 'Mentoring', 'Hackathon', 'Networking'];
const types = ['Semua', 'Online', 'Offline', 'Hybrid'];
const levels = ['Semua', 'Beginner', 'Intermediate', 'Advanced'];
const sortByOptions = [
  { value: 'createdAt', label: 'Terbaru' },
  { value: 'startAt', label: 'Tanggal Event' },
  { value: 'title', label: 'Nama Event' },
];

function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.searchQuery) count++;
  if (filters.category) count++;
  if (filters.type) count++;
  if (filters.level) count++;
  if (filters.isFree !== null) count++;
  if (filters.minPrice !== null) count++;
  if (filters.maxPrice !== null) count++;
  if (filters.startDate) count++;
  if (filters.endDate) count++;
  if (filters.sortBy !== 'createdAt') count++;
  if (filters.sortOrder !== 'desc') count++;
  return count;
}

export function EventFilter({ onFilter }: EventFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    type: null,
    level: null,
    searchQuery: '',
    isFree: null,
    minPrice: null,
    maxPrice: null,
    startDate: null,
    endDate: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const activeCount = countActiveFilters(filters);

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

  const handleLevelChange = (level: string) => {
    const newFilters = { ...filters, level: level === 'Semua' ? null : level };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSearchChange = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handlePriceTypeChange = (type: 'free' | 'paid' | 'all') => {
    const newFilters = {
      ...filters,
      isFree: type === 'free' ? true : type === 'paid' ? false : null,
      minPrice: null,
      maxPrice: null,
    };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleMinPriceChange = (value: string) => {
    const price = value ? parseInt(value, 10) : null;
    const newFilters = { ...filters, minPrice: price };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleMaxPriceChange = (value: string) => {
    const price = value ? parseInt(value, 10) : null;
    const newFilters = { ...filters, maxPrice: price };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleStartDateChange = (date: string) => {
    const newFilters = { ...filters, startDate: date || null };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleEndDateChange = (date: string) => {
    const newFilters = { ...filters, endDate: date || null };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSortByChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    const newFilters = { ...filters, sortOrder };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: FilterState = {
      category: null,
      type: null,
      level: null,
      searchQuery: '',
      isFree: null,
      minPrice: null,
      maxPrice: null,
      startDate: null,
      endDate: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(emptyFilters);
    onFilter?.(emptyFilters);
  };

  return (
    <div className="space-y-6 rounded-xl border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      {/* Header with Active Filter Indicator */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-primary dark:text-slate-100">Filters</h3>
        {activeCount > 0 && (
          <span className="inline-block bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {activeCount}
          </span>
        )}
      </div>

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
        <CustomDropdown
          value={filters.category || 'Semua'}
          onChange={(value) => handleCategoryChange(value)}
          placeholder="Pilih kategori"
          options={categories.map((cat) => ({ value: cat, label: cat }))}
        />
      </div>

      {/* Type/Mode Filter */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Format
        </label>
        <CustomDropdown
          value={filters.type || 'Semua'}
          onChange={(value) => handleTypeChange(value)}
          placeholder="Pilih format"
          options={types.map((t) => ({ value: t, label: t }))}
        />
      </div>

      {/* Level Filter */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Level
        </label>
        <CustomDropdown
          value={filters.level || 'Semua'}
          onChange={(value) => handleLevelChange(value)}
          placeholder="Pilih level"
          options={levels.map((lv) => ({ value: lv, label: lv }))}
        />
      </div>

      {/* Price Filter */}
      <div className="border-t border-primary/10 dark:border-slate-700 pt-4">
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Harga
        </label>
        <div className="space-y-3">
          {/* Price Type Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceType"
                checked={filters.isFree === null}
                onChange={() => handlePriceTypeChange('all')}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">Semua</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceType"
                checked={filters.isFree === true}
                onChange={() => handlePriceTypeChange('free')}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">Gratis</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceType"
                checked={filters.isFree === false}
                onChange={() => handlePriceTypeChange('paid')}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">Berbayar</span>
            </label>
          </div>

          {/* Price Range Inputs - Show only when Berbayar is selected */}
          {filters.isFree === false && (
            <div className="space-y-2 pt-2">
              <div>
                <label className="block text-xs font-medium text-primary/70 dark:text-slate-400 mb-1">
                  Min. Harga (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  className="w-full rounded-lg border border-primary/20 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-primary dark:text-slate-100 placeholder-primary/40 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50 dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary/70 dark:text-slate-400 mb-1">
                  Max. Harga (Rp)
                </label>
                <input
                  type="number"
                  placeholder="10000000"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  className="w-full rounded-lg border border-primary/20 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-primary dark:text-slate-100 placeholder-primary/40 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50 dark:focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="border-t border-primary/10 dark:border-slate-700 pt-4">
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Tanggal Event
        </label>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-primary/70 dark:text-slate-400 mb-1">
              Dari
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full rounded-lg border border-primary/20 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-primary dark:text-slate-100 focus:outline-none focus:border-primary/50 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary/70 dark:text-slate-400 mb-1">
              Sampai
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full rounded-lg border border-primary/20 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-primary dark:text-slate-100 focus:outline-none focus:border-primary/50 dark:focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sorting */}
      <div className="border-t border-primary/10 dark:border-slate-700 pt-4">
        <label className="block text-sm font-semibold text-primary dark:text-slate-100 mb-3">
          Urutkan Berdasarkan
        </label>
        <div className="space-y-2">
          <CustomDropdown
            value={filters.sortBy}
            onChange={(value) => handleSortByChange(value)}
            placeholder="Pilih urutan"
            options={sortByOptions}
          />
          <div className="flex gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="radio"
                name="sortOrder"
                checked={filters.sortOrder === 'desc'}
                onChange={() => handleSortOrderChange('desc')}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">Terbaru</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="radio"
                name="sortOrder"
                checked={filters.sortOrder === 'asc'}
                onChange={() => handleSortOrderChange('asc')}
                className="w-4 h-4"
              />
              <span className="text-sm text-primary dark:text-slate-300">Terlama</span>
            </label>
          </div>
        </div>
      </div>

      {/* Reset Button - Show only when there are active filters */}
      {activeCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2.5 text-sm font-medium text-white dark:text-slate-100 bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 border border-rose-600 dark:border-rose-700 rounded-lg hover:from-rose-600 hover:to-rose-700 dark:hover:from-rose-700 dark:hover:to-rose-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>Reset {activeCount} Filter</span>
        </button>
      )}
    </div>
  );
}
