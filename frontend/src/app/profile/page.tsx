/**
 * Profile Page
 * Displays user profile information and quick actions
 */

'use client';

import { useAuth } from '@/features/auth/auth-context';
import { ProfileHeader, ProfileActionsCard, EditProfileModal, ChangePasswordModal } from '@/features/profile/components';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-sm text-primary/70 dark:text-slate-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-slate-100">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-primary/70 dark:text-slate-400">
            View and manage your account information
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Profile Header */}
          <ProfileHeader user={user} />



          {/* Quick Actions */}
          <ProfileActionsCard
            onEditClick={() => setIsEditModalOpen(true)}
            onChangePasswordClick={() => setIsPasswordModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={user.name}
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </main>
  );
}
