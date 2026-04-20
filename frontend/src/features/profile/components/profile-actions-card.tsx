/**
 * Profile Actions Card component
 * Quick action buttons for profile management
 */

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ProfileActionsCardProps = {
  onEditClick?: () => void;
  onChangePasswordClick?: () => void;
};

export function ProfileActionsCard({
  onEditClick,
  onChangePasswordClick,
}: ProfileActionsCardProps) {
  return (
    <div className="rounded-xl border border-primary/15 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <h2 className="mb-4 text-lg font-semibold text-primary dark:text-slate-100">
        Quick Actions
      </h2>

      {/* Actions Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          onClick={onEditClick}
          variant="secondary"
          className="rounded-lg"
        >
          Edit Profile
        </Button>
        <Button
          onClick={onChangePasswordClick}
          variant="secondary"
          className="rounded-lg"
        >
          Change Password
        </Button>
        <Link href="/settings" className="col-span-1 sm:col-span-2">
          <Button variant="secondary" className="w-full rounded-lg">
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
