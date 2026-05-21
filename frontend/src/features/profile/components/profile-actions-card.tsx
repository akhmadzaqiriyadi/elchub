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
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        onClick={onEditClick}
        variant="outline" // Mengubah varian ke outline agar border-nya terlihat jelas
        className="rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Edit Profile
      </Button>

      <Button
        onClick={onChangePasswordClick}
        variant="outline"
        className="rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Change Password
      </Button>

      <Link href="/settings" className="col-span-1 sm:col-span-2">
        <Button
          variant="outline"
          className="w-full rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Settings
        </Button>
      </Link>
    </div>
  );
}
