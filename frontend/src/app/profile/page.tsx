/**
 * Profile Page
 * Displays user profile information and quick actions
 */

'use client';

import { useAuth } from '@/features/auth/auth-context';
import { ProfileHeader, ProfileInfoCard, ProfileActionsCard } from '@/features/profile/components';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    router.push('/login');
    return null;
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      // TODO: Call API to upload avatar
      // For now, this is a placeholder
      const formData = new FormData();
      formData.append('avatar', file);

      // Example API call (uncomment when backend is ready):
      // const response = await fetch('/api/profile/avatar', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // if (!response.ok) throw new Error('Upload failed');
      // const data = await response.json();
      // Update user data with new avatar URL if available

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Avatar uploaded:', file.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error(message);
      throw error;
    }
  };

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
          <ProfileHeader user={user} onAvatarUpload={handleAvatarUpload} />

          {/* Profile Info */}
          <ProfileInfoCard user={user} />

          {/* Quick Actions */}
          <ProfileActionsCard
            onEditClick={() => {
              // TODO: Open edit modal
              toast.info('Edit profile feature coming soon!');
            }}
            onChangePasswordClick={() => {
              // TODO: Open change password modal
              toast.info('Change password feature coming soon!');
            }}
          />
        </div>
      </div>
    </main>
  );
}
