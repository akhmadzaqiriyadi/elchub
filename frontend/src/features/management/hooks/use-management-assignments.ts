'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getManagementAssignments,
  createManagementAssignment,
  updateManagementAssignment,
  deleteManagementAssignment,
  getAssignmentSubmissions,
  gradeAssignmentSubmission,
} from '../api';
import type { AssignmentMutationInput, AssignmentGradeInput } from '../types';

export function useManagementAssignments(eventId: string, token: string) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const assignmentsQuery = useQuery({
    queryKey: ['management', 'events', eventId, 'assignments', page],
    queryFn: () => getManagementAssignments(eventId, token, { page, limit }),
    enabled: Boolean(token && eventId),
  });

  const createAssignment = useMutation({
    mutationFn: (input: AssignmentMutationInput) => createManagementAssignment(eventId, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'events', eventId, 'assignments'] });
    },
  });

  const updateAssignment = useMutation({
    mutationFn: ({ assignmentId, input }: { assignmentId: string; input: AssignmentMutationInput }) =>
      updateManagementAssignment(eventId, assignmentId, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'events', eventId, 'assignments'] });
    },
  });

  const deleteAssignment = useMutation({
    mutationFn: (assignmentId: string) => deleteManagementAssignment(eventId, assignmentId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'events', eventId, 'assignments'] });
    },
  });

  return {
    page,
    setPage,
    assignmentsQuery,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}

export function useAssignmentSubmissions(eventId: string, assignmentId: string, token: string) {
  const queryClient = useQueryClient();

  const submissionsQuery = useQuery({
    queryKey: ['management', 'events', eventId, 'assignments', assignmentId, 'submissions'],
    queryFn: () => getAssignmentSubmissions(eventId, assignmentId, token),
    enabled: Boolean(token && eventId && assignmentId),
  });

  const gradeSubmission = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: AssignmentGradeInput }) =>
      gradeAssignmentSubmission(eventId, assignmentId, userId, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['management', 'events', eventId, 'assignments', assignmentId, 'submissions'],
      });
    },
  });

  return {
    submissionsQuery,
    gradeSubmission,
  };
}
