/**
 * Account Settings Card component
 * Manage account-related settings
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile';
import { useChangePassword } from '@/features/profile/hooks/use-change-password';
import { Lock, User } from 'lucide-react';

type AccountSettingsCardProps = {
  email: string;
  name: string | null;
};

export function AccountSettingsCard({ email, name }: AccountSettingsCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(name || '');
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const isSaving = updateProfileMutation.isPending;
  const isChanging = changePasswordMutation.isPending;

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ name: newName });
      toast.success('Name updated successfully!');
      setIsEditingName(false);
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  return (
    <div className="rounded-xl border border-primary/15 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-primary/15 px-6 py-4 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-primary dark:text-slate-100">
          Account Settings
        </h2>
        <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
          Manage your account information
        </p>
      </div>

      {/* Content */}
      <div className="space-y-4 px-6 py-4">
        {/* Email (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary dark:text-slate-200">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary/50 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-primary/60 dark:text-slate-400">
            Email cannot be changed
          </p>
        </div>

        {/* Name (Editable) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary dark:text-slate-200">
            Full Name
          </label>
          {isEditingName ? (
            <>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
                disabled={isSaving}
                className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder-primary/40 transition-colors focus:border-primary/50 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setNewName(name || '');
                    setIsEditingName(false);
                  }}
                  variant="secondary"
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50">
                <span className="text-sm text-primary dark:text-slate-100">
                  {name || 'No name set'}
                </span>
                <Button
                  onClick={() => setIsEditingName(true)}
                  variant="secondary"
                  size="default"
                  className="text-xs"
                >
                  Edit
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Change Password Section */}
        <div className="mt-8 border-t border-primary/10 pt-6 dark:border-slate-700">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary/70 dark:text-slate-400" />
              <h3 className="font-medium text-primary dark:text-slate-200">Password</h3>
            </div>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="secondary"
                size="default"
                className="text-xs"
              >
                Change Password
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/30">
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary dark:text-slate-200">Current Password</label>
                <PasswordInput
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary dark:text-slate-200">New Password</label>
                <PasswordInput
                  required
                  minLength={8}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary dark:text-slate-200">Confirm New Password</label>
                <PasswordInput
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  variant="secondary"
                  disabled={isChanging}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isChanging} className="flex-1">
                  {isChanging ? 'Changing...' : 'Update Password'}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-primary/60 dark:text-slate-400">
              Secure your account by updating your password regularly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
