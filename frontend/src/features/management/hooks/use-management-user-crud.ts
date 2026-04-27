'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createManagementUser,
  updateManagementUser,
  deleteManagementUser,
} from '../api';
import { useAuth } from '@/features/auth';
import type { CreateUserInput, UpdateUserInput } from '../types';

export function useManagementUserCrud() {
  const { token: accessToken } = useAuth();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateUserInput) =>
      createManagementUser(input, accessToken!),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('User created successfully');
        queryClient.invalidateQueries({ queryKey: ['management-users'] });
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserInput }) =>
      updateManagementUser(userId, input, accessToken!),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('User updated successfully');
        queryClient.invalidateQueries({ queryKey: ['management-users'] });
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) =>
      deleteManagementUser(userId, accessToken!),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['management-users'] });
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
