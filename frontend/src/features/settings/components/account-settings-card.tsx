/**
 * Account Settings Card component
 * Manage account-related settings
 */

'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

type AccountSettingsCardProps = {
  email: string;
  name: string | null;
};

export function AccountSettingsCard({ email, name }: AccountSettingsCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Call API to update name
      // const response = await fetch('/api/profile/name', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: newName }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Name updated successfully!');
      setIsEditingName(false);
    } catch (error) {
      toast.error('Failed to update name');
    } finally {
      setIsSaving(false);
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
      </div>
    </div>
  );
}
