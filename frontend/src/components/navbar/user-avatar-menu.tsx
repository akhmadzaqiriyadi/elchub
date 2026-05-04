/**
 * User Avatar Menu component
 * Dropdown menu showing user profile and logout option
 */

'use client';

import { useAuth } from '@/features/auth/auth-context';
import { Button } from '@/components/ui/button';
import { LogoutConfirmModal } from '@/components/ui/logout-confirm-modal';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

type UserAvatarMenuProps = {
  className?: string;
};

export function UserAvatarMenu({ className }: UserAvatarMenuProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is in dashboard
  const isDashboard = pathname.startsWith('/dashboard');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  if (!user) {
    return null;
  }

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email[0].toUpperCase();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setIsOpen(false);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    router.replace('/login');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#2E417B] text-white dark:bg-blue-600 hover:opacity-90 transition-opacity font-medium text-xs sm:text-sm"
        title={user.name || user.email}
        disabled={isLoading}
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-primary/15 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50 mx-2 sm:mx-0"
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-primary/15 dark:border-slate-700">
            <p className="text-sm font-medium text-[#2E417B] dark:text-slate-100">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-primary/70 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Dashboard Link - Show only when not in dashboard */}
            {!isDashboard && (
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-primary dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/my-events"
              className="block px-4 py-2 text-sm text-primary dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              My Events
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-primary dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              My Profile
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-primary dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </div>

          {/* Logout Button */}
          <div className="border-t border-primary/15 dark:border-slate-700 p-2">
            <Button
              onClick={handleLogoutClick}
              disabled={isLoading}
              className="w-full rounded-lg bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoading}
        userName={user.name || user.email}
      />
    </div>
  );
}
