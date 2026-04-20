/**
 * Navbar action buttons component
 * Shows Login/Register buttons when not authenticated
 * Shows user avatar menu when authenticated
 */

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-context';
import { UserAvatarMenu } from './user-avatar-menu';
import { NotificationBell } from './notification-bell';
import { ShoppingCart } from './quick-stats-chart';

interface NavbarActionsProps {
  className?: string;
}

export function NavbarActions({ className }: NavbarActionsProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Shopping Cart */}
        <ShoppingCart />

        {/* Notifications Bell */}
        <NotificationBell />

        {/* User Avatar Menu */}
        <UserAvatarMenu />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Login Link */}
      <Link
        href="/login"
        className="text-sm font-medium text-[#2E417B] hover:text-[#1f2a52] dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
      >
        Login
      </Link>

      {/* Daftar/Join Button */}
      <Button
        href="/register"
        className="rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Daftar / Join
      </Button>
    </div>
  );
}
