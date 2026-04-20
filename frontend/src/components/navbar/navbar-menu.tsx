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
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);

  return (
    <nav className={cn('flex items-center gap-6', className)}>
      {items.map((item) => {
        // Direct link for non-dropdown items
        if (!item.isDropdown && item.href) {
          return (
            <NavbarLink
              key={item.label}
              href={item.href}
              label={item.label}
              className="px-2 py-1"
            />
          );
        }

        // Dropdown items
        const isHovering = hoveredDropdown === item.label;
        const isOpen = openDropdown === item.label;

        return (
          <div
            key={item.label}
            className="relative group"
            onMouseEnter={() => setHoveredDropdown(item.label)}
            onMouseLeave={() => setHoveredDropdown(null)}
          >
            <button
              className={cn(
                'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors',
                'text-[#2E417B] hover:text-[#1f2a52]',
                'dark:text-slate-300 dark:hover:text-slate-100',
                (isOpen || isHovering) && 'text-[#2E417B] font-semibold dark:text-slate-100',
              )}
              onClick={() =>
                setOpenDropdown(isOpen ? null : item.label)
              }
            >
              {item.label}
              {item.isDropdown && (
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    (isOpen || isHovering) && 'rotate-180',
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
          </div>
        );
      })}
    </nav>
  );
}
