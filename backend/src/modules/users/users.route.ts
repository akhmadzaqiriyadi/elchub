import { UserRole } from '@prisma/client';
import { Elysia, t } from 'elysia';

import { requireRole } from '../../lib/rbac';
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from './users.service';

// ---------------------------------------------------------------------------
// Helper — map service errors to HTTP status
// ---------------------------------------------------------------------------

function mapUserError(error: unknown): { status: number; message: string } {
  const message = error instanceof Error ? error.message : undefined;

  if (message?.includes('not found')) {
    return { status: 404, message: message };
  }

  if (
    message?.includes('already registered') ||
    message?.includes('already used')
  ) {
    return { status: 409, message: message };
  }

  if (
    message?.includes('required') ||
    message?.includes('at least') ||
    message?.includes('Invalid role')
  ) {
    return { status: 400, message: message };
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: string }).code
      : undefined;

  if (code === 'P2002') {
    return { status: 409, message: 'Email is already registered' };
  }

  if (code === 'P2025') {
    return { status: 404, message: 'User not found' };
  }

  return {
    status: 400,
    message: error instanceof Error ? error.message : 'Failed to process user request',
  };
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const authErrorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
});

const mutationErrorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
});

const mutationSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String(),
});

const userRoleSchema = t.Union([
  t.Literal(UserRole.USER),
  t.Literal(UserRole.ORGANIZER),
  t.Literal(UserRole.MENTOR),
  t.Literal(UserRole.ADMIN),
]);

const userRowSchema = t.Object({
  id: t.String(),
  name: t.Nullable(t.String()),
  email: t.String({ format: 'email' }),
  role: userRoleSchema,
  isActive: t.Boolean(),
  emailVerifiedAt: t.Nullable(t.String({ format: 'date-time' })),
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' }),
});

const listUsersQuerySchema = t.Object({
  q: t.Optional(t.String({ description: 'Search by name or email' })),
  role: t.Optional(
    t.Union([
      t.Literal(UserRole.USER),
      t.Literal(UserRole.ORGANIZER),
      t.Literal(UserRole.MENTOR),
      t.Literal(UserRole.ADMIN),
    ]),
  ),
  isActive: t.Optional(t.BooleanString({ description: 'Filter by active status' })),
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
});

const listUsersSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    items: t.Array(userRowSchema),
    pagination: t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
    }),
  }),
});

const userSuccessSchema = t.Object({
  success: t.Literal(true),
  data: userRowSchema,
});

const createUserBodySchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8, maxLength: 72 }),
  role: t.Optional(userRoleSchema),
  isActive: t.Optional(t.Boolean()),
});

const updateUserBodySchema = t.Object({
  name: t.Optional(t.String({ maxLength: 120 })),
  email: t.Optional(t.String({ format: 'email' })),
  password: t.Optional(t.String({ minLength: 8, maxLength: 72 })),
  role: t.Optional(userRoleSchema),
  isActive: t.Optional(t.Boolean()),
});

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const usersManagementRoute = new Elysia({ name: 'users-management-route' })
  // GET /api/management/users  — list with search, filter, pagination
  .get(
    '/api/management/users',
    async ({ headers, query, set }) => {
      const authResult = await requireRole(headers, [UserRole.ADMIN]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      const data = await listUsers({
        q: query.q,
        role: query.role,
        isActive: query.isActive,
        page: query.page,
        limit: query.limit,
      });

      return {
        success: true as const,
        data,
      };
    },
    {
      query: listUsersQuerySchema,
      response: {
        200: listUsersSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Users Management'],
        summary: 'List users',
        description:
          'Admin-only: list all users with search (name/email), role filter, isActive filter, and pagination.',
      },
    },
  )

  // GET /api/management/users/:id  — get single user
  .get(
    '/api/management/users/:id',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [UserRole.ADMIN]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await getUserById(params.id);
        return { success: true as const, data };
      } catch (error) {
        const mapped = mapUserError(error);
        set.status = mapped.status;
        return { success: false as const, message: mapped.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: userSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
        404: mutationErrorSchema,
      },
      detail: {
        tags: ['Users Management'],
        summary: 'Get user by ID',
        description: 'Admin-only: get a single user detail by ID.',
      },
    },
  )

  // POST /api/management/users  — create user
  .post(
    '/api/management/users',
    async ({ headers, body, set }) => {
      const authResult = await requireRole(headers, [UserRole.ADMIN]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await createUser(body);
        set.status = 201;
        return { success: true as const, data };
      } catch (error) {
        const mapped = mapUserError(error);
        set.status = mapped.status;
        return { success: false as const, message: mapped.message };
      }
    },
    {
      body: createUserBodySchema,
      response: {
        201: userSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
        409: mutationErrorSchema,
      },
      detail: {
        tags: ['Users Management'],
        summary: 'Create user',
        description: 'Admin-only: create a new user with a specified role.',
      },
    },
  )

  // PATCH /api/management/users/:id  — update user
  .patch(
    '/api/management/users/:id',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [UserRole.ADMIN]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await updateUser(params.id, body);
        return { success: true as const, data };
      } catch (error) {
        const mapped = mapUserError(error);
        set.status = mapped.status;
        return { success: false as const, message: mapped.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: updateUserBodySchema,
      response: {
        200: userSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
        404: mutationErrorSchema,
        409: mutationErrorSchema,
      },
      detail: {
        tags: ['Users Management'],
        summary: 'Update user',
        description:
          'Admin-only: update a user. All fields are optional — only provided fields are updated.',
      },
    },
  )

  // DELETE /api/management/users/:id  — delete user
  .delete(
    '/api/management/users/:id',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [UserRole.ADMIN]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        await deleteUser(params.id);
        return { success: true as const, message: 'User deleted successfully' };
      } catch (error) {
        const mapped = mapUserError(error);
        set.status = mapped.status;
        return { success: false as const, message: mapped.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: mutationSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
        404: mutationErrorSchema,
      },
      detail: {
        tags: ['Users Management'],
        summary: 'Delete user',
        description: 'Admin-only: permanently delete a user by ID.',
      },
    },
  );
