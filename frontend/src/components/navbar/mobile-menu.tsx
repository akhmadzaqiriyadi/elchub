/**
 * Mobile menu drawer component
 * Shows navigation menu on mobile devices when hamburger is clicked
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { LogoutConfirmModal } from '@/components/ui/logout-confirm-modal';
import { Button } from '@/components/ui/button';
import { NavbarActions } from './navbar-actions';
import type { NavItem } from './navbar.types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

export function MobileMenu({ isOpen, onClose, items }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathnameRef = useRef<string>(pathname);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [activeSection, setActiveSection] = useState<'cart' | 'notifications' | 'profile' | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Mock data - sama dengan yang di desktop
  const cartItems = [
    { id: '1', name: 'Premium Course', price: 99.99, quantity: 1 },
    { id: '2', name: 'Advanced Training', price: 149.99, quantity: 1 },
  ];

  const notifications = [
    {
      id: '1',
      message: 'Welcome to UCH!',
      type: 'success' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: '2',
      message: 'New feature available',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
    },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    if (isOpen && prevPathnameRef.current !== pathname) {
      onClose();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (shouldRender) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [shouldRender, onClose]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const backdrop = backdropRef.current;
    const panel = panelRef.current;

    if (!backdrop || !panel) {
      return;
    }

    const context = gsap.context(() => {
      if (isOpen) {
        gsap.set(backdrop, { opacity: 0 });
        gsap.set(panel, { opacity: 0, y: -20, scaleY: 0.98, transformOrigin: 'top center' });

        const tl = gsap.timeline();
        tl.to(backdrop, { opacity: 1, duration: 0.2, ease: 'power1.out' })
          .to(panel, { opacity: 1, y: 0, scaleY: 1, duration: 0.32, ease: 'power2.out' }, 0)
          .fromTo(
            '[data-mobile-item]',
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.2, stagger: 0.02, ease: 'power1.out' },
            0.08,
          );
      } else {
        const tl = gsap.timeline({
          onComplete: () => {
            setShouldRender(false);
          },
        });

        tl.to('[data-mobile-item]', {
          opacity: 0,
          y: -6,
          duration: 0.12,
          stagger: { each: 0.01, from: 'end' },
          ease: 'power1.in',
        })
          .to(panel, { opacity: 0, y: -16, scaleY: 0.98, duration: 0.22, ease: 'power2.in' }, 0)
          .to(backdrop, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0);
      }
    }, panel);

    return () => {
      context.revert();
    };
  }, [isOpen, shouldRender]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Helper function to check if a link is active
  const isLinkActive = (href: string) => {
    // Exact match or prefix match
    if (pathname === href) return true;
    if (pathname.startsWith(href + '/')) return true;
    return false;
  };

  // Find the most specific active item to avoid duplicates
  const getMostSpecificActiveItem = () => {
    let mostSpecific: string | null = null;
    let maxLength = 0;

    items.forEach((item) => {
      if (item.href && isLinkActive(item.href)) {
        if (item.href.length > maxLength) {
          mostSpecific = item.href;
          maxLength = item.href.length;
        }
      }
      // Check children too
      if (item.children) {
        item.children.forEach((child) => {
          if (child.href && isLinkActive(child.href)) {
            if (child.href.length > maxLength) {
              mostSpecific = child.href;
              maxLength = child.href.length;
            }
          }
        });
      }
    });

    return mostSpecific;
  };

  const mostSpecificActive = getMostSpecificActiveItem();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    onClose();
    router.replace('/login');
  };

  if (!shouldRender) {
    return (
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoading}
        userName={user?.name || user?.email}
      />
    );
  }

  return (
    <>


      <div className="fixed inset-x-0 top-0 z-50 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
        <div
          ref={panelRef}
          className={cn(
            'mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900',
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800" data-mobile-item>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Menu</p>
              <p className="text-sm font-semibold text-[#2E417B] dark:text-slate-100">Navigasi UCH Connection</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Tutup menu mobile"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(100vh-6.5rem)] overflow-y-auto">
              <nav className="flex flex-col p-4 gap-1">
                {items.map((item) => {
                  // Direct link for non-dropdown items
                  if (!item.isDropdown && item.href) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        data-mobile-item
                        className={cn(
                          'px-4 py-3 text-sm font-medium rounded-lg transition-colors border-b-2 border-transparent',
                          mostSpecificActive === item.href
                            ? 'text-[#2E417B] font-semibold dark:text-white border-[#2E417B] dark:border-white'
                            : 'text-[#2E417B] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                        )}
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  // Dropdown items for mobile
                  if (item.isDropdown && item.children) {
                    return (
                      <details key={item.label} className="group" data-mobile-item>
                        <summary
                          className={cn(
                            'px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                            'text-[#2E417B] hover:bg-slate-100 cursor-pointer',
                            'dark:text-slate-300 dark:hover:bg-slate-800',
                            'list-none',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{item.label}</span>
                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                          </div>
                        </summary>
                        <div className="pl-4 pt-2 pb-2 flex flex-col gap-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href || '#'}
                              className={cn(
                                'px-4 py-2 text-xs font-medium rounded transition-colors border-l-2 border-transparent',
                                child.href && mostSpecificActive === child.href
                                  ? 'text-[#2E417B] font-semibold dark:text-white border-[#2E417B] dark:border-white'
                                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                              )}
                              onClick={onClose}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </details>
                    );
                  }

                  return null;
                })}
              </nav>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-800 my-2" data-mobile-item />

            {/* Quick Action Buttons - Cart, Notifications, Profile */}
            {isAuthenticated && (
              <>
                <div className="px-4 py-3 flex items-center gap-2" data-mobile-item>
                  {/* Cart Button */}
                  <button
                    onClick={() => setActiveSection(activeSection === 'cart' ? null : 'cart')}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors relative',
                      activeSection === 'cart'
                        ? 'bg-slate-100 text-[#2E417B] dark:bg-slate-700 dark:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                    )}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Cart</span>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {cartItems.length > 9 ? '9+' : cartItems.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Button */}
                  <button
                    onClick={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors relative',
                      activeSection === 'notifications'
                        ? 'bg-slate-100 text-[#2E417B] dark:bg-slate-700 dark:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                    )}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Notif</span>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Profile Button */}
                  <button
                    onClick={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                      activeSection === 'profile'
                        ? 'bg-slate-100 text-[#2E417B] dark:bg-slate-700 dark:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                    )}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 100-16 8 8 0 000 16zm0-13a3 3 0 100 6 3 3 0 000-6zm0-1a4 4 0 110 8 4 4 0 010-8z" />
                    </svg>
                    <span>Profile</span>
                  </button>
                </div>

                {/* Active Section Content */}
                {activeSection === 'cart' && (
                  <div className="border-t border-slate-200 dark:border-slate-800 px-2 py-4" data-mobile-item>
                    <h3 className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Shopping Cart ({cartItems.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            {item.name}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center px-2 mb-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <Link
                        href="/cart"
                        onClick={onClose}
                        className="block w-full text-center px-3 py-2 text-xs font-medium bg-[#2E417B] text-white rounded-lg hover:bg-[#1f2a52] transition-colors"
                      >
                        View Full Cart
                      </Link>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="border-t border-slate-200 dark:border-slate-800 px-2 py-4" data-mobile-item>
                    <h3 className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Notifications ({notifications.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="px-2 py-2 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        >
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(notif.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/notifications"
                      onClick={onClose}
                      className="block w-full mt-3 text-center px-3 py-2 text-xs font-medium bg-[#2E417B] text-white rounded-lg hover:bg-[#1f2a52] transition-colors"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}

                {activeSection === 'profile' && (
                  <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4" data-mobile-item>
                    <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Profile
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {user?.name || 'User'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 break-all">
                          {user?.email || 'email@example.com'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={onClose}
                      className="block w-full mt-3 text-center px-3 py-2 text-xs font-medium bg-[#2E417B] text-white rounded-lg hover:bg-[#1f2a52] transition-colors"
                    >
                      Edit Profile
                    </Link>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-800 my-2" data-mobile-item />

                {/* Logout Button */}
                <div className="px-4 py-3" data-mobile-item>
                  <Button
                    onClick={handleLogoutClick}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 text-xs font-medium"
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}

            {/* Auth Actions at bottom */}
            <div className="px-2 py-4" data-mobile-item>
              <NavbarActions className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoading}
        userName={user?.name || user?.email}
      />
    </>
  );
}
