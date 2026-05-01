'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { useManagementUsers } from '../hooks/use-management-users';
import { useManagementUserCrud } from '../hooks/use-management-user-crud';
import { UserTableRow } from './user-table-row';
import { UserFormModal } from './user-form-modal';
import { UserDetailModal } from './user-detail-modal';
import { UserFilters } from './user-filters';
import { CustomDropdown } from './custom-dropdown';
import { WarningModal } from '@/components/ui/warning-modal';
import { Pagination } from '@/components/ui/pagination';
import type { UserListItem, UserRole } from '../types';
import type { CreateUserInput, UpdateUserInput } from '../types';
import type { UserFormInput, UserUpdateFormInput } from '../validation/user-form';

export function ManagementUsersPanel() {
  const {
    searchInput,
    setSearchInput,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    page,
    setPage,
    limit,
    setLimit,
    usersQuery,
    handleResetFilters,
  } = useManagementUsers();

  const { createMutation, updateMutation, deleteMutation } = useManagementUserCrud();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [viewingUser, setViewingUser] = useState<UserListItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);

  const items = usersQuery.data?.data.items ?? [];
  const pagination = usersQuery.data?.data.pagination;

  const summary = useMemo(() => {
    const total = pagination?.total ?? items.length;
    const active = items.filter((item) => item.isActive).length;
    const inactive = items.filter((item) => !item.isActive).length;
    const admins = items.filter((item) => item.role === 'ADMIN').length;

    return { total, active, inactive, admins };
  }, [items, pagination?.total]);

  // Handle create user
  const handleCreateUser = (data: UserFormInput | UserUpdateFormInput) => {
    createMutation.mutate({
      name: data.name,
      email: data.email,
      password: (data as UserFormInput).password,
      role: (data.role as UserRole) || 'USER',
      isActive: data.isActive !== false,
    } as CreateUserInput);
    setIsCreateModalOpen(false);
  };

  // Handle edit user
  const handleEditUser = (user: UserListItem) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: UserListItem) => {
    setViewingUser(user);
    setIsDetailModalOpen(true);
  };

  // Handle update user
  const handleUpdateUser = (data: UserFormInput | UserUpdateFormInput) => {
    if (!editingUser) return;

    const updateData: UpdateUserInput = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if ((data as UserUpdateFormInput).password) {
      updateData.password = (data as UserUpdateFormInput).password;
    }
    if (data.role) updateData.role = data.role as UserRole;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    updateMutation.mutate({
      userId: editingUser.id,
      input: updateData,
    });
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Handle delete user
  const handleDeleteClick = (user: UserListItem) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete.id);
    setUserToDelete(null);
  };

  const isLoading = usersQuery.isLoading;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header with Title and Create Button */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          User Management
        </h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2E417B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#23306a] dark:bg-[#3a5394] dark:hover:bg-[#2e4280]"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Users
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary.total}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Active
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
            {summary.active}
          </p>
        </div>
        <div className="rounded-xl border border-slate-300 bg-slate-100 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">
            Inactive
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-300">
            {summary.inactive}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-xs uppercase tracking-wide text-red-700 dark:text-red-300">
            Admins
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-700 dark:text-red-300">
            {summary.admins}
          </p>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        searchInput={searchInput}
        onSearchChange={(value) => {
          setPage(1);
          setSearchInput(value);
        }}
        selectedRole={selectedRole}
        onRoleChange={(role) => {
          setPage(1);
          setSelectedRole(role);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setPage(1);
          setSelectedStatus(status);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading users...
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
                  No users found
                </td>
              </tr>
            )}
            {items.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {pagination && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Page size</span>
            <div className="w-24">
              <CustomDropdown
                value={String(limit)}
                onChange={(nextValue) => {
                  setPage(1);
                  setLimit(Number(nextValue));
                }}
                placeholder="Items per page"
                options={[
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                ]}
              />
            </div>
          </div>

          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            isLoading={usersQuery.isFetching}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        isLoading={isSaving}
        mode="create"
      />

      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUpdateUser}
        isLoading={isSaving}
        editingUser={editingUser}
        mode="edit"
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        userId={viewingUser?.id ?? null}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingUser(null);
        }}
      />

      <WarningModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description="This action cannot be undone"
        message={`Are you sure you want to delete ${userToDelete?.name || userToDelete?.email || 'this user'}?`}
        confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
      />
    </section>
  );
}
