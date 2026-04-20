/**
 * Settings Page
 * Manage account settings, privacy, and notifications
 */

'use client';

import { useAuth } from '@/features/auth/auth-context';
import {
  AccountSettingsCard,
  PrivacySettingsCard,
  NotificationSettingsCard,
} from '@/features/settings';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function SettingsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    router.push('/login');
    return null;
  }

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-sm text-primary/70 dark:text-slate-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-slate-100">
            Settings
          </h1>
          <p className="mt-2 text-sm text-primary/70 dark:text-slate-400">
            Manage your account settings, privacy, and notification preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <AccountSettingsCard email={user.email} name={user.name} />

          {/* Privacy Settings */}
          <PrivacySettingsCard />

          {/* Notification Settings */}
          <NotificationSettingsCard />
        </div>
      </div>
    </main>
  );
}
