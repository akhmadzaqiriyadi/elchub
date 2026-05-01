'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';

import { userFormSchema, userUpdateFormSchema } from '../validation/user-form';
import { CustomDropdown } from './custom-dropdown';
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
    setValue,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-slate-900">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {mode === 'create' ? 'Create New User' : 'Edit User'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <form onSubmit={handleSubmit((data: UserFormInput | UserUpdateFormInput) => onSubmit(data))} className="space-y-4 p-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="John Doe"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{String(errors.name?.message)}</p>
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
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{String(errors.email?.message)}</p>
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.password?.message)}</p>
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.confirmPassword?.message)}</p>
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.password?.message)}</p>
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{String(errors.confirmPassword?.message)}</p>
                )}
              </div>
            </>
          )}

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>
            <div className="mt-2">
              <CustomDropdown
                value={watch('role') || 'USER'}
                onChange={(value) => {
                  setValue('role', value as UserRole, { shouldValidate: true });
                }}
                placeholder="Select role"
                options={ROLE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              />
            </div>
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">{String(errors.role?.message)}</p>
            )}
            <input
              {...register('role')}
              type="hidden"
              className="hidden"
            />
          </div>

          {/* Active Status - Checkbox */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('isActive')}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 bg-white text-[#2E417B] dark:border-slate-600 dark:bg-slate-700"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                User is Active
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
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
              className="flex-1 rounded-lg bg-[#2E417B] px-4 py-2 text-sm font-medium text-white hover:bg-[#23306a] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3a5394] dark:hover:bg-[#2e4280]"
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </button>
          </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
