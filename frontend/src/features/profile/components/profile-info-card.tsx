/**
 * Profile Info Card component
 * Displays detailed user information
 */

'use client';

import type { AuthUser } from '@/features/auth/types';

type ProfileInfoCardProps = {
  user: AuthUser;
};

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const infoItems = [
    {
      label: 'Email',
      value: user.email,
    },
    {
      label: 'Name',
      value: user.name || '-',
    },
    {
      label: 'Role',
      value: user.role,
    },
  ];

  return (
    <div className="rounded-xl border border-primary/15 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-primary/15 px-6 py-4 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-primary dark:text-slate-100">
          Account Information
        </h2>
      </div>

      {/* Content */}
      <div className="space-y-0">
        {infoItems.map((item, index) => (
          <div
            key={item.label}
            className={`flex items-center justify-between border-t border-primary/10 px-6 py-4 dark:border-slate-700/50 ${
              index === infoItems.length - 1 ? '' : ''
            }`}
          >
            <span className="text-sm font-medium text-primary/70 dark:text-slate-400">
              {item.label}
            </span>
            <span className="text-sm text-primary dark:text-slate-200">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
