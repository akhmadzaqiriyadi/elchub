/**
 * Privacy Settings Card component
 * Manage privacy and visibility settings
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type PrivacySettingsCardProps = {
  onSettingChange?: (setting: string, value: boolean) => void;
};

export function PrivacySettingsCard({ onSettingChange }: PrivacySettingsCardProps) {
  const [settings, setSettings] = useState({
    profilePublic: false,
    allowSearch: true,
    shareActivity: false,
  });

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    try {
      // TODO: Call API to update privacy setting
      // await fetch('/api/settings/privacy', {
      //   method: 'PUT',
      //   body: JSON.stringify({ [key]: newValue }),
      // });

      onSettingChange?.(key, newValue);
      toast.success('Setting updated!');
    } catch (error) {
      // Revert on error
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      toast.error('Failed to update setting');
    }
  };

  return (
    <div className="rounded-xl border border-primary/15 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-primary/15 px-6 py-4 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-primary dark:text-slate-100">
          Privacy Settings
        </h2>
        <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
          Control who can see your information
        </p>
      </div>

      {/* Content */}
      <div className="space-y-0 divide-y divide-primary/10 dark:divide-slate-700/50">
        {/* Public Profile */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Public Profile
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Allow others to view your profile
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.profilePublic}
              onChange={() => handleToggle('profilePublic')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>

        {/* Allow Search */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Allow Search
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Let others find you in search results
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.allowSearch}
              onChange={() => handleToggle('allowSearch')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>

        {/* Share Activity */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Share Activity
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Share your activity with friends
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.shareActivity}
              onChange={() => handleToggle('shareActivity')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>
      </div>
    </div>
  );
}
