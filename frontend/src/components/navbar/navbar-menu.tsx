/**
 * Navbar menu component with dropdown support
 * Renders navigation items with optional dropdown menus
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavbarLink } from './navbar-link';
import type { NavItem } from './navbar.types';

interface NavbarMenuProps {
  items: NavItem[];
  className?: string;
}

export function NavbarMenu({ items, className }: NavbarMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {items.map((item) => (
        <div key={item.label} className="relative group">
          <button
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors',
              'text-[#2E417B] hover:text-[#1f2a52]',
              'dark:text-slate-300 dark:hover:text-slate-100',
              openDropdown === item.label && 'text-[#2E417B] font-semibold',
            )}
            onClick={() =>
              setOpenDropdown(
                openDropdown === item.label ? null : item.label,
              )
            }
          >
            {item.label}
            {item.isDropdown && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  openDropdown === item.label && 'rotate-180',
                )}
              />
            )}
          </button>

          {/* Dropdown menu */}
          {item.isDropdown && item.children && (
            <div
              className={cn(
                'absolute left-0 mt-1 w-48 rounded-lg bg-white shadow-lg',
                'border border-slate-200 py-1',
                'dark:bg-slate-900 dark:border-slate-800',
                'opacity-0 invisible transition-all group-hover:opacity-100 group-hover:visible',
              )}
            >
              {item.children.map((child) => (
                <NavbarLink
                  key={child.label}
                  href={child.href || '#'}
                  label={child.label}
                  className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 w-full text-left"
                />
              ))}
            </div>
          )}

          {/* Direct link if not dropdown */}
          {!item.isDropdown && item.href && (
            <NavbarLink
              href={item.href}
              label={item.label}
              className="hidden"
            />
          )}
        </div>
      ))}
    </nav>
  );
}
