/**
 * Notifications Bell Component
 * Shows notification icon with badge and dropdown list
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export type Notification = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
};

type NotificationBellProps = {
  className?: string;
};

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Mock notifications - in production, fetch from API
  const notifications: Notification[] = [
    {
      id: '1',
      message: 'Welcome to UCH!',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
    },
    {
      id: '2',
      message: 'New feature available',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: false,
    },
    {
      id: '3',
      message: 'Profile updated successfully',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
  ];

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors text-[#2E417B] dark:text-slate-300"
        title="Notifications"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-primary/15 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-primary/15 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary dark:text-slate-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-primary/10 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 transition-colors ${
                      notification.read
                        ? 'bg-white dark:bg-slate-800'
                        : 'bg-primary/5 dark:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Type Indicator */}
                      <div
                        className={`w-1 rounded-full flex-shrink-0 ${
                          notification.type === 'success'
                            ? 'bg-green-500'
                            : notification.type === 'error'
                            ? 'bg-red-500'
                            : notification.type === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary dark:text-slate-100">
                          {notification.message}
                        </p>
                        <p className="text-xs text-primary/60 dark:text-slate-400 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-primary/60 dark:text-slate-400">
                  No notifications
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-primary/15 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-900">
              <Link
                href="/notifications"
                className="block w-full px-3 py-2 text-center text-xs font-medium text-[#2E417B] dark:text-blue-400 hover:bg-primary/5 dark:hover:bg-slate-700 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
