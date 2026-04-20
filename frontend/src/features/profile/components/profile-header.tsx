/**
 * Profile Header component
 * Displays user avatar, name and email
 * Avatar is clickable to upload new profile picture
 */

'use client';

import { useState } from 'react';
import type { AuthUser } from '@/features/auth/types';
import { AvatarUploadModal } from './avatar-upload-modal';
import { toast } from 'sonner';

type ProfileHeaderProps = {
  user: AuthUser;
  onAvatarUpload?: (file: File) => Promise<void>;
};

export function ProfileHeader({ user, onAvatarUpload }: ProfileHeaderProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email[0].toUpperCase();

  const handleAvatarUpload = async (file: File) => {
    if (onAvatarUpload) {
      await onAvatarUpload(file);
      toast.success('Avatar updated successfully!');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 rounded-xl border border-primary/15 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
        {/* Avatar - Clickable */}
        <button
          onClick={() => setIsAvatarModalOpen(true)}
          className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#2E417B] text-2xl font-semibold text-white transition-all hover:shadow-lg dark:bg-blue-600"
          title="Click to change avatar"
        >
          {initials}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </button>

        {/* User Info */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary dark:text-slate-100">
            {user.name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
            {user.email}
          </p>
        </div>

        {/* Role Badge */}
        <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-4 py-1 dark:bg-blue-900/30">
          <span className="text-xs font-medium uppercase text-[#2E417B] dark:text-blue-300">
            {user.role}
          </span>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onUpload={handleAvatarUpload}
        currentInitials={initials}
      />
    </>
  );
}
