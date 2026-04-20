/**
 * Navbar search input component
 * Simple search field with icon
 */

'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function NavbarSearch({
  placeholder = 'Cari kelas atau event...',
  onSearch,
}: NavbarSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center">
      <div
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-slate-100 border border-transparent',
          'dark:bg-slate-800 dark:border-slate-700',
          isFocused && 'ring-2 ring-[#2E417B]/50 border-[#2E417B]',
        )}
      >
        <Search className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="bg-transparent text-sm outline-none w-40 sm:w-48 md:w-56 lg:w-72"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
