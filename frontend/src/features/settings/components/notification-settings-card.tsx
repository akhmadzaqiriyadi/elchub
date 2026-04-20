/**
 * Notification Settings Card component
 * Manage notification preferences
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type NotificationSettingsCardProps = {
  onSettingChange?: (setting: string, value: boolean) => void;
};

export function NotificationSettingsCard({
  onSettingChange,
}: NotificationSettingsCardProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    activityNotifications: false,
    weeklyDigest: true,
    promotionalEmails: false,
  });

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    try {
      // TODO: Call API to update notification setting
      // await fetch('/api/settings/notifications', {
      //   method: 'PUT',
      //   body: JSON.stringify({ [key]: newValue }),
      // });

      onSettingChange?.(key, newValue);
      toast.success('Notification setting updated!');
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
          Notification Settings
        </h2>
        <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
          Choose how you want to receive notifications
        </p>
      </div>

      {/* Content */}
      <div className="space-y-0 divide-y divide-primary/10 dark:divide-slate-700/50">
        {/* Email Notifications */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Email Notifications
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Receive notifications via email
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Push Notifications
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Receive push notifications in browser
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>

        {/* Activity Notifications */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Activity Notifications
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Notify about account activity and logins
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.activityNotifications}
              onChange={() => handleToggle('activityNotifications')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>

        {/* Weekly Digest */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Weekly Digest
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Receive weekly summary email
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>

        {/* Promotional Emails */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-medium text-primary dark:text-slate-100">
              Promotional Emails
            </p>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Receive special offers and promotions
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.promotionalEmails}
              onChange={() => handleToggle('promotionalEmails')}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full border border-primary/20 bg-primary/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-primary/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-600 dark:peer-checked:bg-green-600 dark:peer-checked:after:bg-slate-600" />
          </label>
        </div>
      </div>
    </div>
  );
}
