'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, isLoaded } = useTheme();

  return (
    <button
      type="button"
      aria-label="Ganti tema"
      onClick={toggleTheme}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/80 bg-white/80 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800',
        className,
      )}
    >
      {!isLoaded ? (
        <span className="h-4 w-4" />
      ) : theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
