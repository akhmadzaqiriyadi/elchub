'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { userFormSchema, userUpdateFormSchema } from '../validation/user-form';
import type { UserListItem, UserRole } from '../types';
import type { UserFormInput, UserUpdateFormInput } from '../validation/user-form';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormInput | UserUpdateFormInput) => void;
  isLoading?: boolean;
  editingUser?: UserListItem | null;
  mode: 'create' | 'edit';
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'USER', label: 'Regular User' },
  { value: 'ORGANIZER', label: 'Event Organizer' },
  { value: 'MENTOR', label: 'Community Mentor' },
  { value: 'ADMIN', label: 'Admin' },
];

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingUser,
  mode,
}: UserFormModalProps) {
  const schema = mode === 'create' ? userFormSchema : userUpdateFormSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UserFormInput | UserUpdateFormInput>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      role: editingUser?.role || 'USER',
      isActive: editingUser?.isActive !== undefined ? editingUser.isActive : true,
    },
  });

  useEffect(() => {
    if (isOpen && editingUser && mode === 'edit') {
      reset({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
    } else if (isOpen && mode === 'create') {
      reset({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
        isActive: true,
      });
    }
  }, [isOpen, editingUser, mode, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {mode === 'create' ? 'Create New User' : 'Edit User'}
        </h3>

        <form onSubmit={handleSubmit((data: UserFormInput | UserUpdateFormInput) => onSubmit(data))} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name (Optional)
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="John Doe"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{String(errors.name?.message)}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="user@example.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{String(errors.email?.message)}</p>
            )}
          </div>

          {/* Password Field (only for create mode) */}
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{String(errors.password?.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password *
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{String(errors.confirmPassword?.message)}</p>
                )}
              </div>
            </>
          )}

          {/* Password Field (optional for edit mode) */}
          {mode === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  New Password (Optional)
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{String(errors.password?.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{String(errors.confirmPassword?.message)}</p>
                )}
              </div>
            </>
          )}

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>
            <select
              {...register('role')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{String(errors.role?.message)}</p>
            )}
          </div>

          {/* Status Field */}
          <div>
            <label className="flex items-center gap-2">
              <input
                {...register('isActive')}
                type="checkbox"
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
