/**
 * Profile Header component
 * Displays user avatar, name and email
 * Avatar is clickable to upload new profile picture
 */

'use client';

import { useState, useRef } from 'react';
import type { AuthUser } from '@/features/auth/types';
import { toast } from 'sonner';
import { useUploadProfilePhoto } from '../hooks/use-upload-profile-photo';
import { Pencil } from 'lucide-react';
import Image from 'next/image';

type ProfileHeaderProps = {
  user: AuthUser;
  onAvatarUpload?: (file: File) => Promise<void>;
};

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatarMutation = useUploadProfilePhoto();

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email[0].toUpperCase();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Tolong pilih file gambar yang valid');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    try {
      const promise = uploadAvatarMutation.mutateAsync(file);
      toast.promise(promise, {
        loading: 'Mengunggah foto profil...',
        success: 'Foto profil berhasil diperbarui!',
        error: 'Gagal mengunggah foto profil',
      });
      await promise;
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 rounded-xl border border-primary/15 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Avatar - Clickable */}
        <button
          onClick={handleClick}
          disabled={uploadAvatarMutation.isPending}
          className={`group relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#2E417B] text-3xl font-semibold text-white shadow-md transition-all hover:shadow-xl dark:border-slate-700 dark:bg-blue-600 ${
            uploadAvatarMutation.isPending ? 'cursor-not-allowed opacity-80' : ''
          }`}
          title="Click to change avatar"
        >
          <div className="h-full w-full overflow-hidden rounded-full">
            {user.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt={user.name || 'Avatar'}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            {uploadAvatarMutation.isPending ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                className="h-8 w-8 text-white"
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
            )}
          </div>

          {/* Edit Pen Indicator */}
          <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-110 dark:border-slate-800">
            <Pencil className="h-4 w-4" />
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
    </>
  );
}
