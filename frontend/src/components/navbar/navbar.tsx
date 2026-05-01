/**
 * Main Navbar component
 * Sticky navbar with navigation menu, search, and action buttons
 * Follows atomic component pattern with clear layer separation
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/features/auth/auth-context';
import { NavbarMenu } from './navbar-menu';
import { NavbarSearch } from './navbar-search';
import { NavbarActions } from './navbar-actions';
import { MobileMenu } from './mobile-menu';
import { NAVBAR_MENU_ITEMS, DASHBOARD_MENU_ITEMS, MANAGEMENT_MENU_ITEMS, NAVBAR_CONFIG } from './navbar.constants';
import type { NavbarProps } from './navbar.types';

const managementRoles = new Set(['ADMIN', 'ORGANIZER']);

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Determine current page location
  const isDashboard = pathname.startsWith('/dashboard');
  const isManagementPath = pathname.startsWith('/management');
  
  const isManagementRole = Boolean(isAuthenticated && user?.role && managementRoles.has(user.role));

  // Choose menu items based on location and role
  // Management path: always show management menu
  // Dashboard path: show management menu for admin/organizer, dashboard menu for others
  // Home page: show navbar menu for all roles
  const menuItems = isManagementPath
    ? MANAGEMENT_MENU_ITEMS
    : isDashboard
      ? isManagementRole
        ? MANAGEMENT_MENU_ITEMS
        : DASHBOARD_MENU_ITEMS
      : NAVBAR_MENU_ITEMS;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full',
        NAVBAR_CONFIG.bgColor,
        NAVBAR_CONFIG.borderColor,
        'backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
        <div className={cn('flex items-center justify-between h-12 sm:h-14 md:h-16 gap-2 sm:gap-3')}>
          {/* Left Section: Logo with Text */}
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg md:text-xl font-bold text-[#2E417B] dark:text-slate-100 hover:opacity-80 transition-opacity flex-shrink-0 min-w-fit"
          >
            {/* Logo Image */}
            <Image
              src="/images/navbar/uch (1).webp"
              alt="UCH Connection Logo"
              width={32}
              height={32}
              priority
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            />
            <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{NAVBAR_CONFIG.brandName}</span>
          </Link>

          {/* Center Section: Menu + Search (Desktop only) */}
          <div className="hidden lg:flex items-center gap-4 md:gap-6 flex-1 justify-center">
            <NavbarMenu items={menuItems} />
          </div>

          {/* Right Section: Search (Desktop), Actions & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0 ml-auto">
            {/* Search (Desktop only) */}
            <div className="hidden lg:flex">
              <NavbarSearch placeholder="Cari kelas atau event..." />
            </div>

            {/* Actions (Desktop only - lg and up) */}
            <NavbarActions className="hidden lg:flex" />

            {/* Theme Toggle (Always visible) */}
            <ThemeToggle />

            {/* Mobile Menu Button (Hidden on lg and up) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1 sm:p-1.5 text-[#2E417B] dark:text-slate-300 hover:opacity-80 transition-opacity"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
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
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={menuItems}
      />
    </header>
  );
}
