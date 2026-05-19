import { UserRole } from '@prisma/client';
import { Elysia, t } from 'elysia';

import { requireAuth, requireRole } from '../../lib/rbac';
import { normalizePagination } from '../../lib/list-query';
import {
  createManagementEvent,
  createManagementMasterData,
  deleteManagementEvent,
  deleteManagementMasterData,
  getManagementEventById,
  getEventMasterData,
  listEvents,
  getEventByIdOrSlug,
  listManagementMasterData,
  updateManagementEvent,
  updateManagementMasterData,
  registerForEvent,
  getMyEvents,
  getEventRegistrations,
  updateRegistrationStatus,
  createEventSection,
  updateEventSection,
  deleteEventSection,
  createEventMaterial,
  updateEventMaterial,
  deleteEventMaterial,
  getEventSyllabus,
  markMaterialAsCompleted,
  unmarkMaterialAsCompleted,
  reorderEventSections,
  reorderEventMaterials,
} from './events.service';
import { uploadEventBanner, uploadPaymentProof, uploadEventDocument } from '../../lib/storage';

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
        image: t.Nullable(t.String()),
        meetLink: t.Nullable(t.String()),
        startAt: t.Nullable(t.String({ format: 'date-time' })),
        endAt: t.Nullable(t.String({ format: 'date-time' })),
        registrationOpenAt: t.Nullable(t.String({ format: 'date-time' })),
        registrationCloseAt: t.Nullable(t.String({ format: 'date-time' })),
        timezone: t.Nullable(t.String()),
        capacity: t.Nullable(t.Number()),
        attendees: t.Number(),
        isFree: t.Boolean(),
        price: t.Nullable(t.Number()),
        formSchema: t.Nullable(t.Any()),
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
  levelSlug: t.Optional(t.String()),
  statusCode: t.Optional(t.String()),
  isFree: t.Optional(t.Union([t.Boolean(), t.String()])),
  minPrice: t.Optional(t.Numeric()),
  maxPrice: t.Optional(t.Numeric()),
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
  sortBy: t.Optional(t.String()),
  sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  startDate: t.Optional(t.String({ format: 'date-time' })),
  endDate: t.Optional(t.String({ format: 'date-time' })),
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
  imageUrl: t.Optional(t.Union([t.String(), t.Null()])),
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
  isFree: t.Optional(t.Boolean()),
  price: t.Optional(t.Union([t.Numeric(), t.Null()])),
  formSchema: t.Optional(t.Union([t.Any(), t.Null()])),
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

const bannerUploadSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    imageUrl: t.String(),
  }),
});

const managementEventSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    id: t.String(),
    title: t.String(),
    slug: t.String(),
    description: t.Nullable(t.String()),
    image: t.Nullable(t.String()),
    meetLink: t.Nullable(t.String()),
    startAt: t.Nullable(t.String({ format: 'date-time' })),
    endAt: t.Nullable(t.String({ format: 'date-time' })),
    registrationOpenAt: t.Nullable(t.String({ format: 'date-time' })),
    registrationCloseAt: t.Nullable(t.String({ format: 'date-time' })),
    timezone: t.Nullable(t.String()),
    capacity: t.Nullable(t.Number()),
    attendees: t.Number(),
    isFree: t.Boolean(),
    price: t.Nullable(t.Number()),
    formSchema: t.Nullable(t.Any()),
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
    isRegistered: t.Optional(t.Boolean()),
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

const registerEventBodySchema = t.Object({
  customAnswers: t.Optional(t.Union([t.Any(), t.Null()])),
  paymentProofUrl: t.Optional(t.Union([t.String(), t.Null()])),
});

const registerEventSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String(),
  data: t.Object({
    id: t.String(),
    eventId: t.String(),
    userId: t.String(),
    statusId: t.String(),
    paymentStatus: t.String(),
    paymentProofUrl: t.Nullable(t.String()),
    createdAt: t.String({ format: 'date-time' }),
  }),
});

const myEventsSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    items: t.Array(
      t.Object({
        registrationId: t.String(),
        status: t.String(),
        statusCode: t.String(),
        paymentStatus: t.String(),
        registeredAt: t.String({ format: 'date-time' }),
        event: managementEventSuccessSchema.properties.data,
      })
    ),
    pagination: t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
    }),
  }),
});

const syllabusErrorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
});

const syllabusQuerySchema = t.Object({
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
});

const syllabusSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    sections: t.Array(
      t.Object({
        id: t.String(),
        title: t.String(),
        order: t.Number(),
        materials: t.Array(
          t.Object({
            id: t.String(),
            title: t.String(),
            type: t.String(),
            durationMin: t.Nullable(t.Number()),
            isPreview: t.Boolean(),
            order: t.Number(),
            content: t.Nullable(t.String()),
            videoUrl: t.Nullable(t.String()),
            fileUrl: t.Nullable(t.String()),
            userProgress: t.Nullable(
              t.Object({
                isCompleted: t.Boolean(),
                completedAt: t.Nullable(t.String({ format: 'date-time' })),
              }),
            ),
          }),
        ),
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

const myEventsQuerySchema = t.Object({
  q: t.Optional(t.String()),
  statusCode: t.Optional(t.String()),
  paymentStatus: t.Optional(t.String()),
  typeSlug: t.Optional(t.String()),
  modeSlug: t.Optional(t.String()),
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
});

const eventRegistrationsSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Array(
    t.Object({
      id: t.String(),
      user: t.Object({
        id: t.String(),
        name: t.Nullable(t.String()),
        email: t.String({ format: 'email' }),
      }),
      status: t.String(),
      statusCode: t.String(),
      paymentStatus: t.String(),
      paymentProofUrl: t.Nullable(t.String()),
      customAnswers: t.Nullable(t.Any()),
      createdAt: t.String({ format: 'date-time' }),
    })
  ),
});

const updateRegistrationStatusBodySchema = t.Object({
  statusCode: t.Optional(t.String()),
  paymentStatus: t.Optional(t.String()),
});

const eventSectionBodySchema = t.Object({
  title: t.String({ minLength: 3 }),
  order: t.Optional(t.Numeric()),
  isActive: t.Optional(t.Boolean()),
});

const eventMaterialBodySchema = t.Object({
  title: t.String({ minLength: 3 }),
  type: t.Union([t.Literal('ARTICLE'), t.Literal('VIDEO'), t.Literal('DOCUMENT'), t.Literal('QUIZ')]),
  content: t.Optional(t.Union([t.String(), t.Null()])),
  videoUrl: t.Optional(t.Union([t.String(), t.Null()])),
  fileUrl: t.Optional(t.Union([t.String(), t.Null()])),
  durationMin: t.Optional(t.Union([t.Numeric(), t.Null()])),
  isPreview: t.Optional(t.Boolean()),
  order: t.Optional(t.Numeric()),
});

const reorderBodySchema = t.Object({
  ids: t.Array(t.String()),
});

const documentUploadSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    fileUrl: t.String(),
  }),
});

export const eventsRoute = new Elysia({ name: 'events-route' })
  .get(
    '/api/events',
    async ({ query }) => {
      let isFreeParam: boolean | undefined = undefined;
      if (query.isFree !== undefined) {
        isFreeParam = query.isFree === true || query.isFree === 'true';
      }

      const data = await listEvents({
        q: query.q,
        typeSlug: query.typeSlug,
        modeSlug: query.modeSlug,
        levelSlug: query.levelSlug,
        statusCode: query.statusCode,
        isFree: isFreeParam,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
        startDate: query.startDate,
        endDate: query.endDate,
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
    '/api/events/highlights',
    async () => {
      const data = await listEvents({
        statusCode: 'PUBLISHED',
        page: 1,
        limit: 3,
      });

      return {
        success: true as const,
        data,
      };
    },
    {
      response: {
        200: listEventsSuccessSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'Event highlights',
        description: 'Latest public published events for the landing page.',
      },
    },
  )
  .get(
    '/api/events/:id',
    async ({ params, headers, set }) => {
      try {
        let userId: string | undefined;
        if (headers.authorization) {
          const authResult = await requireAuth(headers as Record<string, string | undefined>);
          if (authResult.ok) {
            userId = authResult.user.id;
          }
        }

        const data = await getEventByIdOrSlug(params.id, userId);

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
        404: mutationErrorSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'Get event by id or slug',
        description: 'Get public event details by id or slug.',
      },
    },
  )
  .get(
    '/api/events/:id/syllabus',
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
        const data = await getEventSyllabus(params.id, userId, false, pagination.page, pagination.limit);

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to load syllabus',
        };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      query: syllabusQuerySchema,
      response: {
        200: syllabusSuccessSchema,
        500: syllabusErrorSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'Get event syllabus',
        description: 'Get syllabus/curriculum for an event with pagination support.',
      },
    },
  )
  .post(
    '/api/events/materials/:materialId/complete',
    async ({ headers, params, set }) => {
      const authResult = await requireAuth(headers as Record<string, string | undefined>);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }

      try {
        const data = await markMaterialAsCompleted(
          { userId: authResult.user.id, role: authResult.user.role as any },
          params.materialId
        );

        return {
          success: true as const,
          message: 'Material marked as completed',
          data,
        };
      } catch (error) {
        set.status = 403;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Forbidden',
        };
      }
    },
    {
      params: t.Object({ materialId: t.String() }),
      detail: {
        tags: ['Events'],
        summary: 'Mark material as completed',
        description: 'Marks a learning material as completed for the authenticated user.',
      },
    },
  )
  .delete(
    '/api/events/materials/:materialId/complete',
    async ({ headers, params, set }) => {
      const authResult = await requireAuth(headers as Record<string, string | undefined>);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }

      try {
        await unmarkMaterialAsCompleted(
          { userId: authResult.user.id, role: authResult.user.role as any },
          params.materialId
        );

        return {
          success: true as const,
          message: 'Material completion unmarked',
        };
      } catch (error) {
        set.status = 403;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Forbidden',
        };
      }
    },
    {
      params: t.Object({ materialId: t.String() }),
      detail: {
        tags: ['Events'],
        summary: 'Unmark material as completed',
        description: 'Removes the completion mark from a learning material for the authenticated user.',
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
  )
  .post(
    '/api/events/:id/register',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [UserRole.USER, UserRole.ORGANIZER, UserRole.ADMIN, UserRole.MENTOR]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const registration = await registerForEvent(
          {
            userId: authResult.user.id,
            role: authResult.user.role,
          },
          params.id,
          {
            customAnswers: body.customAnswers,
            paymentProofUrl: body.paymentProofUrl,
          }
        );

        return {
          success: true as const,
          message: 'Successfully registered for event',
          data: registration,
        };
      } catch (error) {
        const mappedError = mapMasterDataError(error);
        set.status = mappedError.status;
        return {
          success: false as const,
          message: mappedError.message,
        };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: registerEventBodySchema,
      response: {
        200: registerEventSuccessSchema,
        400: mutationErrorSchema,
        401: authErrorSchema,
        404: mutationErrorSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'Register for event',
        description: 'Registers the authenticated user for the specified event.',
      },
    },
  )
  .post(
    '/api/uploads/payment-proof',
    async ({ headers, request, set }) => {
      const authResult = await requireAuth(headers as Record<string, string | undefined>);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
          set.status = 400;
          return {
            success: false as const,
            message: 'Payment proof file is required',
          };
        }

        if (!file.type.startsWith('image/')) {
          set.status = 400;
          return {
            success: false as const,
            message: 'Only image files are allowed',
          };
        }

        if (file.size > 2 * 1024 * 1024) {
          set.status = 400;
          return {
            success: false as const,
            message: 'Payment proof size must be less than 2MB',
          };
        }

        const { imageUrl } = await uploadPaymentProof(file);

        return {
          success: true as const,
          data: { imageUrl },
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to upload payment proof',
        };
      }
    },
    {
      detail: {
        tags: ['Events'],
        summary: 'Upload payment proof',
        description: 'Upload payment proof image for event registration.',
      },
    },
  )
  .get(
    '/api/events/my-events',
    async ({ headers, query, set }) => {
      const authResult = await requireAuth(headers as Record<string, string | undefined>);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await getMyEvents({
          userId: authResult.user.id,
          role: authResult.user.role,
        }, {
          q: query.q,
          statusCode: query.statusCode,
          paymentStatus: query.paymentStatus,
          typeSlug: query.typeSlug,
          modeSlug: query.modeSlug,
          page: query.page,
          limit: query.limit,
        });

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to fetch your events',
        };
      }
    },
    {
      query: myEventsQuerySchema,
      response: {
        200: myEventsSuccessSchema,
        401: authErrorSchema,
        500: mutationErrorSchema,
      },
      detail: {
        tags: ['Events'],
        summary: 'Get my registered events',
        description: 'Get a list of events the authenticated user has registered for.',
      },
    },
  );

const managementRoles = [UserRole.ADMIN, UserRole.ORGANIZER] as const;

export const eventsManagementRoute = new Elysia({ name: 'events-management-route' })
  .post(
    '/api/management/uploads/event-banner',
    async ({ headers, request, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
          set.status = 400;
          return {
            success: false as const,
            message: 'Banner image file is required',
          };
        }

        if (!file.type.startsWith('image/')) {
          set.status = 400;
          return {
            success: false as const,
            message: 'Only image files are allowed',
          };
        }

        if (file.size > 5 * 1024 * 1024) {
          set.status = 400;
          return {
            success: false as const,
            message: 'Banner image must be 5MB or smaller',
          };
        }

        const uploaded = await uploadEventBanner(file);

        return {
          success: true as const,
          data: {
            imageUrl: uploaded.imageUrl,
          },
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to upload banner image',
        };
      }
    },
    {
      response: {
        200: bannerUploadSuccessSchema,
        400: authErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Upload event banner',
        description: 'Upload a banner image to MinIO and return its public URL.',
      },
    },
  )
  .post(
    '/api/management/uploads/event-material',
    async ({ headers, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const file = body.file as File;
        
        if (!file) {
          set.status = 400;
          return { success: false as const, message: 'File is required' };
        }

        if (file.size > 20 * 1024 * 1024) {
          set.status = 400;
          return { success: false as const, message: 'Document must be 20MB or smaller' };
        }

        const uploaded = await uploadEventDocument(file);

        return {
          success: true as const,
          data: {
            fileUrl: uploaded.fileUrl,
          },
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to upload material document',
        };
      }
    },
    {
      body: t.Object({
        file: t.File(),
      }),
      response: {
        200: documentUploadSuccessSchema,
        400: authErrorSchema,
        401: authErrorSchema,
        403: authErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Upload event material document',
        description: 'Upload an event material document (PDF, ZIP, DOCX) to MinIO and return its public URL.',
      },
    },
  )
  .get(
    '/api/management/events',
    async ({ headers, query, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await listEvents({
          q: query.q,
          typeSlug: query.typeSlug,
          modeSlug: query.modeSlug,
          statusCode: query.statusCode,
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
          startDate: query.startDate,
          endDate: query.endDate,
        });

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to fetch events',
        };
      }
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

      try {
        const data = await getEventMasterData();

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to fetch master data',
        };
      }
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
  )
  .get(
    '/api/management/events/:id/registrations',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await getEventRegistrations(
          { userId: authResult.user.id, role: authResult.user.role },
          params.id,
        );

        return {
          success: true as const,
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to fetch event registrations',
        };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: {
        200: eventRegistrationsSuccessSchema,
        401: authErrorSchema,
        403: authErrorSchema,
        500: mutationErrorSchema,
      },
      detail: {
        tags: ['Management'],
        summary: 'Get event registrations',
        description: 'Role-protected fetch for event registrations.',
      },
    },
  )
  .patch(
    '/api/management/events/:id/registrations/:registrationId',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);

      if (!authResult.ok) {
        set.status = authResult.status;
        return authResult.body;
      }

      try {
        const data = await updateRegistrationStatus(
          { userId: authResult.user.id, role: authResult.user.role },
          params.id,
          params.registrationId,
          body,
        );

        return {
          success: true as const,
          message: 'Registration updated successfully',
          data,
        };
      } catch (error) {
        set.status = 400;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to update registration',
        };
      }
    },
    {
      params: t.Object({ id: t.String(), registrationId: t.String() }),
      body: updateRegistrationStatusBodySchema,
      detail: {
        tags: ['Management'],
        summary: 'Update event registration status',
        description: 'Update the status or payment status of an event registration.',
      },
    },
  )
  .post(
    '/api/management/events/:id/sections',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        const data = await createEventSection({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, body);
        return { success: true as const, message: 'Section created', data };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String() }), body: eventSectionBodySchema }
  )
  .put(
    '/api/management/events/:id/sections/:sectionId',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        const data = await updateEventSection({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, params.sectionId, body);
        return { success: true as const, message: 'Section updated', data };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String(), sectionId: t.String() }), body: eventSectionBodySchema }
  )
  .delete(
    '/api/management/events/:id/sections/:sectionId',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        await deleteEventSection({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, params.sectionId);
        return { success: true as const, message: 'Section deleted' };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String(), sectionId: t.String() }) }
  )
  .post(
    '/api/management/events/:id/sections/:sectionId/materials',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        const data = await createEventMaterial({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, params.sectionId, body);
        return { success: true as const, message: 'Material created', data };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String(), sectionId: t.String() }), body: eventMaterialBodySchema }
  )
  .put(
    '/api/management/events/:id/materials/:materialId',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        const data = await updateEventMaterial({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, params.materialId, body);
        return { success: true as const, message: 'Material updated', data };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String(), materialId: t.String() }), body: eventMaterialBodySchema }
  )
  .delete(
    '/api/management/events/:id/materials/:materialId',
    async ({ headers, params, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        await deleteEventMaterial({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, params.materialId);
        return { success: true as const, message: 'Material deleted' };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String(), materialId: t.String() }) }
  )
  .put(
    '/api/management/events/:id/sections/reorder',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        await reorderEventSections({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, body.ids);
        return { success: true as const, message: 'Sections reordered' };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String() }), body: reorderBodySchema }
  )
  .put(
    '/api/management/events/:id/sections/:sectionId/materials/reorder',
    async ({ headers, params, body, set }) => {
      const authResult = await requireRole(headers, [...managementRoles]);
      if (!authResult.ok) { set.status = authResult.status; return authResult.body; }
      try {
        await reorderEventMaterials({ userId: authResult.user.id, role: authResult.user.role as any }, params.id, params.sectionId, body.ids);
        return { success: true as const, message: 'Materials reordered' };
      } catch (error) {
        set.status = 400;
        return { success: false as const, message: error instanceof Error ? error.message : 'Error' };
      }
    },
    { params: t.Object({ id: t.String(), sectionId: t.String() }), body: reorderBodySchema }
  );