'use client';

import { useQuery } from '@tanstack/react-query';

import { BaseModal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth';

import { getManagementUserById } from '../api';

type UserDetailModalProps = {
  isOpen: boolean;
  userId: string | null;
  onClose: () => void;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleString('id-ID');
}

export function UserDetailModal({ isOpen, userId, onClose }: UserDetailModalProps) {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['management', 'users', 'detail', userId, token],
    queryFn: () => getManagementUserById(userId as string, token as string),
    enabled: Boolean(isOpen && userId && token),
  });

  const user = data?.data;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Detail"
      description="Detail informasi akun user"
      className="max-w-2xl"
    >
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading user detail...</p>}

      {error && <p className="text-sm text-red-600 dark:text-red-400">Failed to load user detail.</p>}

      {!isLoading && !error && !user && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No user found.</p>
      )}

      {user && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Name
            </label>
            <Input readOnly value={user.name ?? '-'} className="h-auto py-2" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Email
            </label>
            <Input readOnly value={user.email} className="h-auto py-2" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Role
            </label>
            <Input readOnly value={user.role} className="h-auto py-2" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Status
            </label>
            <Input readOnly value={user.isActive ? 'Active' : 'Inactive'} className="h-auto py-2" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Email Verified
            </label>
            <Input readOnly value={formatDateTime(user.emailVerifiedAt)} className="h-auto py-2" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Created At
            </label>
            <Input readOnly value={formatDateTime(user.createdAt)} className="h-auto py-2" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Updated At
            </label>
            <Input readOnly value={formatDateTime(user.updatedAt)} className="h-auto py-2" />
          </div>
        </div>
      )}
    </BaseModal>
  );
}