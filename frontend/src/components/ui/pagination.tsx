'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPageItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, '...', totalPages] as const;
  }

  if (page >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, '...', page - 1, page, page + 1, '...', totalPages] as const;
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  isLoading = false,
  onPageChange,
  className,
}: PaginationProps) {
  const safePage = Math.max(1, page);
  const safeTotalPages = Math.max(1, totalPages);
  const firstItem = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const lastItem = total === 0 ? 0 : Math.min(total, safePage * limit);
  const pageItems = buildPageItems(safePage, safeTotalPages);

  return (
    <div className={cn('mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Page {safePage} of {safeTotalPages}. Showing {firstItem}-{lastItem} of {total} data.
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1 || isLoading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageItems.map((item, index) => {
          if (item === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-500 dark:text-slate-400">
                ...
              </span>
            );
          }

          const isActive = item === safePage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={isLoading}
              className={cn(
                'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm disabled:cursor-not-allowed disabled:opacity-40',
                isActive
                  ? 'border-[#2E417B] bg-[#2E417B] text-white'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
              )}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
          disabled={safePage >= safeTotalPages || isLoading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
