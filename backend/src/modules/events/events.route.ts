import { UserRole } from '@prisma/client';
import { Elysia, t } from 'elysia';

import { requireRole } from '../../lib/rbac';
import {
  createManagementEvent,
  createManagementMasterData,
  deleteManagementEvent,
  deleteManagementMasterData,
  getManagementEventById,
  getEventMasterData,
  listEvents,
  listManagementMasterData,
  updateManagementEvent,
  updateManagementMasterData,
} from './events.service';

function mapMasterDataError(error: unknown) {
  const message = error instanceof Error ? error.message : undefined;

  if (message?.toLowerCase().includes('not found') || message?.toLowerCase().includes('inaccessible')) {
    return {
      status: 404,
      message,
    };
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : undefined;

  const target =
    typeof error === 'object' && error !== null && 'meta' in error && typeof (error as { meta?: unknown }).meta === 'object'
      ? (error as { meta?: { target?: string[] | string } }).meta?.target
      : undefined;

  if (code === 'P2002') {
    const targetText = Array.isArray(target) ? target.join(', ') : typeof target === 'string' ? target : '';

    if (targetText.includes('slug')) {
      return {
        status: 400,
        message: 'Slug already exists. Please use a different slug.',
      };
    }

    if (targetText.includes('code')) {
      return {
        status: 400,
        message: 'Code already exists. Please use a different code.',
      };
    }

    return {
      status: 400,
      message: 'Data already exists. Please use a unique value.',
    };
  }

  if (code === 'P2003') {
    return {
      status: 400,
      message: 'Cannot delete this item because it is already used by events.',
    };
  }

  if (code === 'P2025') {
    return {
      status: 404,
      message: 'Master data item not found.',
    };
  }

  return {
    status: 400,
    message: error instanceof Error ? error.message : 'Failed to process master data request.',
  };
}

const listEventsSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    items: t.Array(
      t.Object({
        id: t.String(),
        title: t.String(),
        slug: t.String(),
        description: t.Nullable(t.String()),
        meetLink: t.Nullable(t.String()),
        startAt: t.Nullable(t.String({ format: 'date-time' })),
        endAt: t.Nullable(t.String({ format: 'date-time' })),
        registrationOpenAt: t.Nullable(t.String({ format: 'date-time' })),
        registrationCloseAt: t.Nullable(t.String({ format: 'date-time' })),
        timezone: t.Nullable(t.String()),
        capacity: t.Nullable(t.Number()),
        type: t.Object({
          name: t.String(),
          slug: t.String(),
        }),
        mode: t.Object({
          name: t.String(),
          slug: t.String(),
        }),
        level: t.Nullable(
          t.Object({
            id: t.String(),
            name: t.String(),
            slug: t.String(),
          }),
        ),
        status: t.Object({
          code: t.String(),
          name: t.String(),
        }),
        organizer: t.Object({
          id: t.String(),
          name: t.Nullable(t.String()),
          email: t.String({ format: 'email' }),
        }),
        createdAt: t.String({ format: 'date-time' }),
        updatedAt: t.String({ format: 'date-time' }),
      }),
    ),
    pagination: t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
    }),
  }),
});

const listEventsQuerySchema = t.Object({
  q: t.Optional(t.String()),
  typeSlug: t.Optional(t.String()),
  modeSlug: t.Optional(t.String()),
  statusCode: t.Optional(t.String()),
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
});

const masterDataKindSchema = t.Union([
  t.Literal('types'),
  t.Literal('topics'),
  t.Literal('modes'),
  t.Literal('levels'),
  t.Literal('statuses'),
]);

const masterDataRowSchema = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.Nullable(t.String()),
  code: t.Nullable(t.String()),
  isActive: t.Boolean(),
  sortOrder: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' }),
});

const masterDataBodySchema = t.Object({
  name: t.Optional(t.String()),
  slug: t.Optional(t.String()),
  code: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Numeric()),
});

const masterDataSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    items: t.Array(masterDataRowSchema),
    pagination: t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
    }),
  }),
});

const masterDataQuerySchema = t.Object({
  q: t.Optional(t.String()),
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
});

const mutationSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String(),
});

const mutationErrorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
});

const createEventBodySchema = t.Object({
  title: t.String({ minLength: 3, maxLength: 120, examples: ['Backend Workshop'] }),
});

const managementEventBodySchema = t.Object({
  title: t.String({ minLength: 3, maxLength: 120 }),
  description: t.Optional(t.String()),
  meetLink: t.Optional(t.String()),
  typeId: t.String(),
  modeId: t.String(),
  levelId: t.Optional(t.Union([t.String(), t.Null()])),
  statusId: t.String(),
  startAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  endAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  registrationOpenAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  registrationCloseAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  timezone: t.Optional(t.String()),
  capacity: t.Optional(t.Union([t.Numeric(), t.Null()])),
});

const createEventSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String({ examples: ['Event scaffold berhasil dibuat'] }),
  data: t.Object({
    title: t.String(),
    createdBy: t.String(),
    createdByRole: t.String({ examples: ['ORGANIZER'] }),
  }),
});

const authErrorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
});

const managementEventSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    id: t.String(),
    title: t.String(),
    slug: t.String(),
    description: t.Nullable(t.String()),
    meetLink: t.Nullable(t.String()),
    startAt: t.Nullable(t.String({ format: 'date-time' })),
    endAt: t.Nullable(t.String({ format: 'date-time' })),
    registrationOpenAt: t.Nullable(t.String({ format: 'date-time' })),
    registrationCloseAt: t.Nullable(t.String({ format: 'date-time' })),
    timezone: t.Nullable(t.String()),
    capacity: t.Nullable(t.Number()),
    type: t.Object({ name: t.String(), slug: t.String() }),
    mode: t.Object({ name: t.String(), slug: t.String() }),
    level: t.Nullable(t.Object({ id: t.String(), name: t.String(), slug: t.String() })),
    status: t.Object({ code: t.String(), name: t.String() }),
    organizer: t.Object({
      id: t.String(),
      name: t.Nullable(t.String()),
      email: t.String({ format: 'email' }),
    }),
    createdAt: t.String({ format: 'date-time' }),
    updatedAt: t.String({ format: 'date-time' }),
  }),
});

const eventMasterDataSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    types: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        slug: t.String(),
      }),
    ),
    topics: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        slug: t.String(),
      }),
    ),
    modes: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        slug: t.String(),
      }),
    ),
    levels: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        slug: t.String(),
      }),
    ),
    eventStatuses: t.Array(
      t.Object({
        id: t.String(),
        code: t.String(),
        name: t.String(),
      }),
    ),
    registrationStatuses: t.Array(
      t.Object({
        id: t.String(),
        code: t.String(),
        name: t.String(),
      }),
    ),
  }),
});

export const eventsRoute = new Elysia({ name: 'events-route' })
  .get(
    '/api/events',
    async ({ query }) => {
      const data = await listEvents({
        q: query.q,
        typeSlug: query.typeSlug,
        modeSlug: query.modeSlug,
        statusCode: query.statusCode,
        page: query.page,
        limit: query.limit,
      });

      return {
        success: true as const,
        data,
      };
    },
    {
      query: listEventsQuerySchema,
      response: {
        200: listEventsSuccessSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'List events',
        description: 'List published events (scaffold endpoint).',
      },
    },
  )
  .get(
    '/api/event-master-data',
    async () => {
      const data = await getEventMasterData();

      return {
        success: true as const,
        data,
      };
    },
    {
      response: {
        200: eventMasterDataSuccessSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'Event master data',
        description: 'Get event master data for management forms and filters.',
      },
    },
  )
  .post(
    '/api/events',
    async ({ headers, body, set }) => {
      const authResult = await requireRole(headers, [UserRole.ORGANIZER, UserRole.ADMIN]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      return {
        success: true,
        message: 'Event scaffold berhasil dibuat',
        data: {
          title: body.title,
          createdBy: authResult.user.id,
          createdByRole: authResult.user.role,
        },
      };
    },
    {
      body: createEventBodySchema,
      response: {
        200: createEventSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'Create event',
        description: 'Create event draft. Allowed roles: ORGANIZER, ADMIN.',
      },
    },
  );

const managementRoles = [UserRole.ADMIN, UserRole.ORGANIZER] as const;

export const eventsManagementRoute = new Elysia({ name: 'events-management-route' })
  .get(
    '/api/management/events',
    async ({ headers, query, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      const data = await listEvents({
        q: query.q,
        typeSlug: query.typeSlug,
        modeSlug: query.modeSlug,
        statusCode: query.statusCode,
        page: query.page,
        limit: query.limit,
      });

      return {
        success: true as const,
        data,
      };
    },
    {
      query: listEventsQuerySchema,
      response: {
        200: listEventsSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Management events list',
        description: 'Role-protected events list for management dashboard.',
      },
    },
  )
  .get(
    '/api/management/events/:id',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await getManagementEventById(
          {
            userId: authResult.user.id,
            role: authResult.user.role,
          },
          params.id,
        );

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        set.status = 404;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Event not found',
        };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: managementEventSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
        404: mutationErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Management event detail',
        description: 'Get event detail for management by id.',
      },
    },
  )
  .post(
    '/api/management/events',
    async ({ headers, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await createManagementEvent(
          {
            userId: authResult.user.id,
            role: authResult.user.role,
          },
          body,
        );

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        const mapped = mapMasterDataError(error);
        set.status = mapped.status;
        return {
          success: false as const,
          message: mapped.message,
        };
      }
    },
    {
      body: managementEventBodySchema,
      response: {
        200: managementEventSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Create management event',
        description: 'Create event in management dashboard.',
      },
    },
  )
  .patch(
    '/api/management/events/:id',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await updateManagementEvent(
          {
            userId: authResult.user.id,
            role: authResult.user.role,
          },
          params.id,
          body,
        );

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        const mapped = mapMasterDataError(error);
        set.status = mapped.status;
        return {
          success: false as const,
          message: mapped.message,
        };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: managementEventBodySchema,
      response: {
        200: managementEventSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
        404: mutationErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Update management event',
        description: 'Update event in management dashboard.',
      },
    },
  )
  .delete(
    '/api/management/events/:id',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        await deleteManagementEvent(
          {
            userId: authResult.user.id,
            role: authResult.user.role,
          },
          params.id,
        );

        return {
          success: true as const,
          message: 'Event deleted',
        };
      } catch (error) {
        const mapped = mapMasterDataError(error);
        set.status = mapped.status;
        return {
          success: false as const,
          message: mapped.message,
        };
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
        tags: ['Management'],
        summary: 'Delete management event',
        description: 'Delete event in management dashboard.',
      },
    },
  )
  .get(
    '/api/management/event-master-data',
    async ({ headers, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      const data = await getEventMasterData();

      return {
        success: true as const,
        data,
      };
    },
    {
      response: {
        200: eventMasterDataSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Management event master data',
        description: 'Role-protected master data source for dashboard form/filter.',
      },
    },
  )
  .get(
    '/api/management/master-data/:kind',
    async ({ headers, params, query, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      const data = await listManagementMasterData(params.kind, {
        q: query.q,
        page: query.page,
        limit: query.limit,
      });

      return {
        success: true as const,
        data,
      };
    },
    {
      params: t.Object({ kind: masterDataKindSchema }),
      query: masterDataQuerySchema,
      response: {
        200: masterDataSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'List master data rows',
        description: 'Role-protected list for specific master data kind.',
      },
    },
  )
  .post(
    '/api/management/master-data/:kind',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        await createManagementMasterData(params.kind, body);

        return {
          success: true as const,
          message: 'Master data created',
        };
      } catch (error) {
        const mapped = mapMasterDataError(error);
        set.status = mapped.status;
        return {
          success: false as const,
          message: mapped.message,
        };
      }
    },
    {
      params: t.Object({ kind: masterDataKindSchema }),
      body: masterDataBodySchema,
      response: {
        200: mutationSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Create master data row',
        description: 'Role-protected create for master data item.',
      },
    },
  )
  .patch(
    '/api/management/master-data/:kind/:id',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        await updateManagementMasterData(params.kind, params.id, body);

        return {
          success: true as const,
          message: 'Master data updated',
        };
      } catch (error) {
        const mapped = mapMasterDataError(error);
        set.status = mapped.status;
        return {
          success: false as const,
          message: mapped.message,
        };
      }
    },
    {
      params: t.Object({ kind: masterDataKindSchema, id: t.String() }),
      body: masterDataBodySchema,
      response: {
        200: mutationSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Update master data row',
        description: 'Role-protected update for master data item.',
      },
    },
  )
  .delete(
    '/api/management/master-data/:kind/:id',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        await deleteManagementMasterData(params.kind, params.id);

        return {
          success: true as const,
          message: 'Master data deleted',
        };
      } catch (error) {
        const mapped = mapMasterDataError(error);
        set.status = mapped.status;
        return {
          success: false as const,
          message: mapped.message,
        };
      }
    },
    {
      params: t.Object({ kind: masterDataKindSchema, id: t.String() }),
      response: {
        200: mutationSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Delete master data row',
        description: 'Role-protected delete for master data item.',
      },
    },
  );