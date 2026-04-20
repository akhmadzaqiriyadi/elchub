/**
 * Main Navbar component
 * Sticky navbar with navigation menu, search, and action buttons
 * Follows atomic component pattern with clear layer separation
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NavbarMenu } from './navbar-menu';
import { NavbarSearch } from './navbar-search';
import { NavbarActions } from './navbar-actions';
import { NAVBAR_MENU_ITEMS, DASHBOARD_MENU_ITEMS, NAVBAR_CONFIG } from './navbar.constants';
import type { NavbarProps } from './navbar.types';

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  
  // Determine if user is in dashboard
  const isDashboard = pathname.startsWith('/dashboard');
  
  // Choose menu items based on current location
  const menuItems = isDashboard ? DASHBOARD_MENU_ITEMS : NAVBAR_MENU_ITEMS;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        NAVBAR_CONFIG.bgColor,
        NAVBAR_CONFIG.borderColor,
        'backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn('flex items-center h-16')}>
          {/* Left Section: Logo + Menu (Landing) or Logo Only (Dashboard) */}
          <div className="flex items-center gap-8 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-[#2E417B] dark:text-slate-100 hover:opacity-80 transition-opacity"
            >
              {/* Logo Image */}
              <Image
                src="/images/navbar/uch (1).webp"
                alt="UCH Connection Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8"
              />
              <span className="hidden sm:inline">{NAVBAR_CONFIG.brandName}</span>
            </Link>

            {/* Navigation Menu (Landing Page only) */}
            {!isDashboard && <NavbarMenu items={menuItems} className="hidden lg:flex" />}
          </div>

          {/* Center Section: Dashboard Menu or Search */}
          {isDashboard ? (
            <div className="flex-1 flex items-center justify-center">
              <NavbarMenu items={menuItems} className="hidden lg:flex" />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <NavbarSearch
                placeholder="Cari kelas atau event..."
              />
            </div>
          )}

          {/* Right Section: Actions & Theme Toggle */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Actions */}
            <NavbarActions className="hidden sm:flex" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-[#2E417B] dark:text-slate-300">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search (Visible only on mobile) */}
        <div className="md:hidden pb-3 flex justify-center">
          <NavbarSearch />
        </div>
      </div>
    </header>
  );
}
