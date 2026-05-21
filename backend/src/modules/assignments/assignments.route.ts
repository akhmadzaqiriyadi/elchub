import { UserRole } from '@prisma/client';
import { Elysia, t } from 'elysia';

import { requireAuth, requireRole } from '../../lib/rbac';
import { normalizePagination } from '../../lib/list-query';
import {
  createEventAssignment,
  deleteEventAssignment,
  gradeAssignmentSubmission,
  getEventAssignment,
  listAssignmentsForManagement,
  listEventAssignments,
  submitAssignment,
  updateEventAssignment,
  listAssignmentSubmissions,
} from './assignments.service';

const sectionSchema = t.Nullable(
  t.Object({
    id: t.String(),
    title: t.String(),
    order: t.Number(),
  }),
);

const submissionSchema = t.Nullable(
  t.Object({
    status: t.String(),
    answerText: t.Nullable(t.String()),
    answerUrl: t.Nullable(t.String()),
    submittedAt: t.String({ format: 'date-time' }),
    score: t.Nullable(t.Number()),
    feedback: t.Nullable(t.String()),
    gradedAt: t.Nullable(t.String({ format: 'date-time' })),
  }),
);

const assignmentItemSchema = t.Object({
  id: t.String(),
  title: t.String(),
  description: t.Nullable(t.String()),
  instructions: t.Nullable(t.String()),
  releaseAt: t.Nullable(t.String({ format: 'date-time' })),
  dueAt: t.Nullable(t.String({ format: 'date-time' })),
  allowLate: t.Boolean(),
  maxScore: t.Nullable(t.Number()),
  isPublished: t.Boolean(),
  order: t.Number(),
  section: sectionSchema,
  userSubmission: submissionSchema,
});

const assignmentListSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    items: t.Array(assignmentItemSchema),
    pagination: t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
    }),
  }),
});

const assignmentDetailSuccessSchema = t.Object({
  success: t.Literal(true),
  data: assignmentItemSchema,
});

const assignmentMutationSchema = t.Object({
  title: t.String({ minLength: 3, maxLength: 150 }),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  instructions: t.Optional(t.Union([t.String(), t.Null()])),
  sectionId: t.Optional(t.Union([t.String(), t.Null()])),
  releaseAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  dueAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  allowLate: t.Optional(t.Boolean()),
  maxScore: t.Optional(t.Union([t.Numeric(), t.Null()])),
  isPublished: t.Optional(t.Boolean()),
  order: t.Optional(t.Numeric()),
});

const submissionBodySchema = t.Object({
  answerText: t.Optional(t.Union([t.String(), t.Null()])),
  answerUrl: t.Optional(t.Union([t.String(), t.Null()])),
});

const gradeBodySchema = t.Object({
  score: t.Optional(t.Union([t.Numeric(), t.Null()])),
  feedback: t.Optional(t.Union([t.String(), t.Null()])),
  status: t.Optional(t.Union([t.Literal('GRADED'), t.Literal('RETURNED')])),
});

const mutationResultSchema = t.Object({
  success: t.Literal(true),
  message: t.String(),
  data: t.Optional(t.Any()),
});

const errorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
});

const userSchema = t.Object({
  id: t.String(),
  name: t.Nullable(t.String()),
  email: t.String(),
  profilePhotoUrl: t.Nullable(t.String()),
});

const submissionItemSchema = t.Object({
  id: t.String(),
  assignmentId: t.String(),
  userId: t.String(),
  answerText: t.Nullable(t.String()),
  answerUrl: t.Nullable(t.String()),
  status: t.String(),
  submittedAt: t.String({ format: 'date-time' }),
  score: t.Nullable(t.Number()),
  feedback: t.Nullable(t.String()),
  gradedBy: t.Nullable(t.String()),
  gradedAt: t.Nullable(t.String({ format: 'date-time' })),
  user: userSchema,
});

const submissionsListSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Array(submissionItemSchema),
});

function mapAssignmentError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to process assignment request';
  const lowered = message.toLowerCase();

  if (lowered.includes('not authorized')) {
    return { status: 403, message };
  }

  if (lowered.includes('not found')) {
    return { status: 404, message };
  }

  return { status: 400, message };
}

export const assignmentsRoute = new Elysia()
  .get(
    '/api/events/:id/assignments',
    async ({ params, headers, query, set }) => {
      try {
        let userId: string | undefined;
        if (headers.authorization) {
          const authResult = await requireAuth(headers as Record<string, string | undefined>);
          if (authResult.ok) {
            userId = authResult.user.id;
          }
        }

        const pagination = normalizePagination({ page: query.page, limit: query.limit });
        const data = await listEventAssignments(params.id, userId, pagination.page, pagination.limit);

        return { success: true as const, data };
      } catch (error) {
        const mapped = mapAssignmentError(error);
        set.status = mapped.status;
        return { success: false as const, message: mapped.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
      }),
      response: {
        200: assignmentListSuccessSchema,
        403: errorSchema,
        404: errorSchema,
        400: errorSchema,
      },
      detail: {
        tags: ['Assignments'],
        summary: 'List event assignments',
        description: 'Get assignments for an event with pagination support.',
      },
    },
  )
  .get(
    '/api/events/:id/assignments/:assignmentId',
    async ({ params, headers, set }) => {
      try {
        let userId: string | undefined;
        if (headers.authorization) {
          const authResult = await requireAuth(headers as Record<string, string | undefined>);
          if (authResult.ok) {
            userId = authResult.user.id;
          }
        }

        const data = await getEventAssignment(params.id, params.assignmentId, userId);
        return { success: true as const, data };
      } catch (error) {
        const mapped = mapAssignmentError(error);
        set.status = mapped.status;
        return { success: false as const, message: mapped.message };
      }
    },
    {
      params: t.Object({ id: t.String(), assignmentId: t.String() }),
      response: {
        200: assignmentDetailSuccessSchema,
        403: errorSchema,
        404: errorSchema,
        400: errorSchema,
      },
      detail: {
        tags: ['Assignments'],
        summary: 'Get assignment detail',
        description: 'Get a single assignment for an event.',
      },
    },
  )
  .post(
    '/api/events/assignments/:assignmentId/submit',
    async ({ headers, params, body, set }) => {
      const authResult = await requireAuth(headers as Record<string, string | undefined>);
      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await submitAssignment(
          { userId: authResult.user.id, role: authResult.user.role as any },
          params.assignmentId,
          body,
        );

        return { success: true as const, message: 'Assignment submitted', data };
      } catch (error) {
        const mapped = mapAssignmentError(error);
        set.status = mapped.status;
        return { success: false as const, message: mapped.message };
      }
    },
    {
      params: t.Object({ assignmentId: t.String() }),
      body: submissionBodySchema,
      response: {
        200: mutationResultSchema,
        400: errorSchema,
        403: errorSchema,
        404: errorSchema,
      },
      detail: {
        tags: ['Assignments'],
        summary: 'Submit assignment',
        description: 'Create or update the current user submission for an assignment.',
      },
    },
  );

export const assignmentsManagementRoute = new Elysia().group('/api/management', (app) =>
  app
    .get(
      '/events/:id/assignments',
      async ({ headers, params, query, set }) => {
        const authResult = await requireRole(headers, [UserRole.ORGANIZER, UserRole.MENTOR, UserRole.ADMIN]);
        if (!authResult.ok) {
          set.status = authResult.status;
          return authResult.body;
        }

        try {
          const pagination = normalizePagination({ page: query.page, limit: query.limit });
          const data = await listAssignmentsForManagement(
            { userId: authResult.user.id, role: authResult.user.role as any },
            params.id,
            pagination.page,
            pagination.limit,
          );
          return { success: true as const, data };
        } catch (error) {
          const mapped = mapAssignmentError(error);
          set.status = mapped.status;
          return { success: false as const, message: mapped.message };
        }
      },
      {
        params: t.Object({ id: t.String() }),
        query: t.Object({
          page: t.Optional(t.Numeric()),
          limit: t.Optional(t.Numeric()),
        }),
        response: {
          200: assignmentListSuccessSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    )
    .post(
      '/events/:id/assignments',
      async ({ headers, params, body, set }) => {
        const authResult = await requireRole(headers, [UserRole.ORGANIZER, UserRole.MENTOR, UserRole.ADMIN]);
        if (!authResult.ok) {
          set.status = authResult.status;
          return authResult.body;
        }

        try {
          const data = await createEventAssignment(
            { userId: authResult.user.id, role: authResult.user.role as any },
            params.id,
            body,
          );

          return { success: true as const, message: 'Assignment created', data };
        } catch (error) {
          const mapped = mapAssignmentError(error);
          set.status = mapped.status;
          return { success: false as const, message: mapped.message };
        }
      },
      {
        params: t.Object({ id: t.String() }),
        body: assignmentMutationSchema,
        response: {
          200: mutationResultSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    )
    .put(
      '/events/:id/assignments/:assignmentId',
      async ({ headers, params, body, set }) => {
        const authResult = await requireRole(headers, [UserRole.ORGANIZER, UserRole.MENTOR, UserRole.ADMIN]);
        if (!authResult.ok) {
          set.status = authResult.status;
          return authResult.body;
        }

        try {
          const data = await updateEventAssignment(
            { userId: authResult.user.id, role: authResult.user.role as any },
            params.id,
            params.assignmentId,
            body,
          );

          return { success: true as const, message: 'Assignment updated', data };
        } catch (error) {
          const mapped = mapAssignmentError(error);
          set.status = mapped.status;
          return { success: false as const, message: mapped.message };
        }
      },
      {
        params: t.Object({ id: t.String(), assignmentId: t.String() }),
        body: assignmentMutationSchema,
        response: {
          200: mutationResultSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    )
    .delete(
      '/events/:id/assignments/:assignmentId',
      async ({ headers, params, set }) => {
        const authResult = await requireRole(headers, [UserRole.ORGANIZER, UserRole.MENTOR, UserRole.ADMIN]);
        if (!authResult.ok) {
          set.status = authResult.status;
          return authResult.body;
        }

        try {
          await deleteEventAssignment(
            { userId: authResult.user.id, role: authResult.user.role as any },
            params.id,
            params.assignmentId,
          );

          return { success: true as const, message: 'Assignment deleted' };
        } catch (error) {
          const mapped = mapAssignmentError(error);
          set.status = mapped.status;
          return { success: false as const, message: mapped.message };
        }
      },
      {
        params: t.Object({ id: t.String(), assignmentId: t.String() }),
        response: {
          200: mutationResultSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    )
    .get(
      '/events/:id/assignments/:assignmentId/submissions',
      async ({ headers, params, set }) => {
        const authResult = await requireRole(headers, [UserRole.ORGANIZER, UserRole.MENTOR, UserRole.ADMIN]);
        if (!authResult.ok) {
          set.status = authResult.status;
          return authResult.body;
        }

        try {
          const data = await listAssignmentSubmissions(
            { userId: authResult.user.id, role: authResult.user.role as any },
            params.id,
            params.assignmentId,
          );
          return { success: true as const, data };
        } catch (error) {
          const mapped = mapAssignmentError(error);
          set.status = mapped.status;
          return { success: false as const, message: mapped.message };
        }
      },
      {
        params: t.Object({ id: t.String(), assignmentId: t.String() }),
        response: {
          200: submissionsListSuccessSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    )
    .patch(
      '/events/:id/assignments/:assignmentId/submissions/:userId/grade',
      async ({ headers, params, body, set }) => {
        const authResult = await requireRole(headers, [UserRole.ORGANIZER, UserRole.MENTOR, UserRole.ADMIN]);
        if (!authResult.ok) {
          set.status = authResult.status;
          return authResult.body;
        }

        try {
          const data = await gradeAssignmentSubmission(
            { userId: authResult.user.id, role: authResult.user.role as any },
            params.id,
            params.assignmentId,
            params.userId,
            body,
          );

          return { success: true as const, message: 'Submission graded', data };
        } catch (error) {
          const mapped = mapAssignmentError(error);
          set.status = mapped.status;
          return { success: false as const, message: mapped.message };
        }
      },
      {
        params: t.Object({ id: t.String(), assignmentId: t.String(), userId: t.String() }),
        body: gradeBodySchema,
        response: {
          200: mutationResultSchema,
          400: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    ),
);