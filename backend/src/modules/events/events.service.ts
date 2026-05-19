import { prisma } from '../../lib/prisma';
import { buildPaginationMeta, normalizePagination, normalizeSearchTerm } from '../../lib/list-query';

export type ListEventsQuery = {
  q?: string;
  typeSlug?: string;
  modeSlug?: string;
  levelSlug?: string;
  statusCode?: string;
  organizerId?: string;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
};

export type ManagementEventPayload = {
  title: string;
  description?: string;
  imageUrl?: string | null;
  meetLink?: string;
  typeId: string;
  modeId: string;
  levelId?: string | null;
  statusId: string;
  startAt?: string | null;
  endAt?: string | null;
  registrationOpenAt?: string | null;
  registrationCloseAt?: string | null;
  timezone?: string;
  capacity?: number | null;
  isFree?: boolean;
  price?: number | null;
  formSchema?: any | null;
};

export type AuthActor = {
  userId: string;
  role: 'USER' | 'ORGANIZER' | 'MENTOR' | 'ADMIN';
};

export type MasterDataKind = 'types' | 'topics' | 'modes' | 'levels' | 'statuses';

export type MasterDataPayload = {
  name?: string;
  slug?: string;
  code?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type ListMasterDataQuery = {
  q?: string;
  page?: number;
  limit?: number;
};

export type ListMyEventsQuery = {
  q?: string;
  statusCode?: string;
  paymentStatus?: string;
  typeSlug?: string;
  modeSlug?: string;
  page?: number;
  limit?: number;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const codePattern = /^[A-Z]+(?:_[A-Z0-9]+)*$/;

function normalizeSortOrder(sortOrder: number | undefined) {
  if (typeof sortOrder !== 'number' || Number.isNaN(sortOrder)) {
    return 0;
  }

  return Math.max(0, Math.floor(sortOrder));
}

function normalizeSlug(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeCode(value: string | undefined) {
  return value?.trim().toUpperCase() ?? '';
}

function normalizeName(value: string | undefined) {
  return value?.trim() ?? '';
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generateUniqueEventSlug(title: string, excludingEventId?: string) {
  const base = slugifyTitle(title) || `event-${Date.now()}`;

  let candidate = base;
  let index = 1;

  while (true) {
    const found = await prisma.event.findFirst({
      where: {
        slug: candidate,
        ...(excludingEventId ? { id: { not: excludingEventId } } : {}),
      },
      select: { id: true },
    });

    if (!found) {
      return candidate;
    }

    index += 1;
    candidate = `${base}-${index}`;
  }
}

function parseOptionalDateTime(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid datetime value');
  }
  return parsed;
}

function normalizeCapacity(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  const normalized = Math.floor(value);

  if (normalized < 1) {
    throw new Error('Capacity must be at least 1 when quota is enabled');
  }

  return normalized;
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

async function validateAndNormalizeEventPayload(input: ManagementEventPayload) {
  const title = normalizeName(input.title);

  if (!title) {
    throw new Error('Title is required');
  }

  const startAt = parseOptionalDateTime(input.startAt);
  const endAt = parseOptionalDateTime(input.endAt);
  const registrationOpenAt = parseOptionalDateTime(input.registrationOpenAt);
  const registrationCloseAt = parseOptionalDateTime(input.registrationCloseAt);
  const capacity = normalizeCapacity(input.capacity);
  const meetLink = input.meetLink?.trim() || null;

  if (meetLink && !isValidHttpUrl(meetLink)) {
    throw new Error('Meet link must be a valid URL');
  }

  const selectedMode = await prisma.eventMode.findUnique({
    where: { id: input.modeId },
    select: { slug: true },
  });

  if (!selectedMode) {
    throw new Error('Mode not found');
  }

  if (selectedMode.slug.toLowerCase() === 'online' && !meetLink) {
    throw new Error('Meet link is required for online mode');
  }

  if (startAt && endAt && endAt <= startAt) {
    throw new Error('End time must be after start time');
  }

  if (registrationOpenAt && registrationCloseAt && registrationOpenAt > registrationCloseAt) {
    throw new Error('Registration open time must be before registration close time');
  }

  if (registrationCloseAt && startAt && registrationCloseAt > startAt) {
    throw new Error('Registration close time cannot be after event start time');
  }

  const isFree = input.isFree ?? true;
  let price = input.price;
  if (!isFree) {
    if (typeof price !== 'number' || price < 0) {
      throw new Error('Price must be a valid positive number for paid events');
    }
  } else {
    price = null;
  }

  return {
    title,
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    meetLink,
    typeId: input.typeId,
    modeId: input.modeId,
    levelId: input.levelId || null,
    statusId: input.statusId,
    startAt,
    endAt,
    registrationOpenAt,
    registrationCloseAt,
    timezone: input.timezone?.trim() || 'Asia/Jakarta',
    capacity,
    isFree,
    price,
    formSchema: input.formSchema ?? null,
  };
}

async function syncEventLifecycleStatuses() {
  const now = new Date();

  const statuses = await prisma.eventStatus.findMany({
    where: {
      code: { in: ['DRAFT', 'PUBLISHED', 'CLOSED', 'COMPLETED'] },
      isActive: true,
    },
    select: {
      id: true,
      code: true,
    },
  });

  const statusByCode = Object.fromEntries(statuses.map((status) => [status.code, status.id])) as Record<string, string>;

  const draftId = statusByCode.DRAFT;
  const publishedId = statusByCode.PUBLISHED;
  const closedId = statusByCode.CLOSED;
  const completedId = statusByCode.COMPLETED;

  if (!draftId || !publishedId || !closedId || !completedId) {
    return;
  }

  await prisma.$transaction([
    prisma.event.updateMany({
      where: {
        statusId: { in: [draftId, publishedId, closedId] },
        endAt: {
          not: null,
          lte: now,
        },
      },
      data: {
        statusId: completedId,
      },
    }),
    prisma.event.updateMany({
      where: {
        statusId: { in: [draftId, publishedId] },
        AND: [
          {
            OR: [{ endAt: null }, { endAt: { gt: now } }],
          },
          {
            OR: [
              {
                registrationCloseAt: {
                  not: null,
                  lte: now,
                },
              },
              {
                startAt: {
                  not: null,
                  lte: now,
                },
              },
            ],
          },
        ],
      },
      data: {
        statusId: closedId,
      },
    }),
    prisma.event.updateMany({
      where: {
        statusId: draftId,
        registrationOpenAt: {
          not: null,
          lte: now,
        },
        AND: [
          {
            OR: [{ registrationCloseAt: null }, { registrationCloseAt: { gt: now } }],
          },
          {
            OR: [{ startAt: null }, { startAt: { gt: now } }],
          },
          {
            OR: [{ endAt: null }, { endAt: { gt: now } }],
          },
        ],
      },
      data: {
        statusId: publishedId,
      },
    }),
  ]);
}

function mapEventItem(item: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  meetLink: string | null;
  createdAt: Date;
  updatedAt: Date;
  startAt: Date | null;
  endAt: Date | null;
  registrationOpenAt: Date | null;
  registrationCloseAt: Date | null;
  timezone: string | null;
  capacity: number | null;
  isFree: boolean;
  price: number | null;
  formSchema: any | null;
  type: { name: string; slug: string };
  mode: { name: string; slug: string };
  status: { code: string; name: string };
  level: { id: string; name: string; slug: string } | null;
  organizer: { id: string; name: string | null; email: string };
  _count?: { registrations: number };
}) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    image: item.imageUrl,
    meetLink: item.meetLink,
    startAt: item.startAt?.toISOString() ?? null,
    endAt: item.endAt?.toISOString() ?? null,
    registrationOpenAt: item.registrationOpenAt?.toISOString() ?? null,
    registrationCloseAt: item.registrationCloseAt?.toISOString() ?? null,
    timezone: item.timezone,
    capacity: item.capacity,
    isFree: item.isFree,
    price: item.price,
    formSchema: item.formSchema,
    type: item.type,
    mode: item.mode,
    level: item.level,
    status: item.status,
    organizer: item.organizer,
    attendees: item._count?.registrations ?? 0,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function assertSlugFormat(slug: string) {
  if (!slugPattern.test(slug)) {
    throw new Error('Slug must be lowercase kebab-case');
  }
}

function assertCodeFormat(code: string) {
  if (!codePattern.test(code)) {
    throw new Error('Code must be UPPERCASE_UNDERSCORE format');
  }
}

export async function listEvents(input: ListEventsQuery) {
  await syncEventLifecycleStatuses();

  const search = normalizeSearchTerm(input.q);
  const pagination = normalizePagination({ page: input.page, limit: input.limit });

  const validSortFields = ['createdAt', 'startAt', 'endAt', 'title'];
  const sortBy = input.sortBy && validSortFields.includes(input.sortBy) ? input.sortBy : 'createdAt';
  const sortOrder = input.sortOrder === 'asc' ? 'asc' : 'desc';

  const startGte = input.startDate ? parseOptionalDateTime(input.startDate) || undefined : undefined;
  const startLte = input.endDate ? parseOptionalDateTime(input.endDate) || undefined : undefined;

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(input.typeSlug ? { type: { slug: input.typeSlug } } : {}),
    ...(input.modeSlug ? { mode: { slug: input.modeSlug } } : {}),
    ...(input.levelSlug ? { level: { slug: input.levelSlug } } : {}),
    ...(input.statusCode ? { status: { code: input.statusCode } } : {}),
    ...(input.organizerId ? { organizerId: input.organizerId } : {}),
    ...(input.isFree !== undefined ? { isFree: input.isFree } : {}),
    ...(input.minPrice !== undefined || input.maxPrice !== undefined
      ? {
          price: {
            ...(input.minPrice !== undefined ? { gte: input.minPrice } : {}),
            ...(input.maxPrice !== undefined ? { lte: input.maxPrice } : {}),
          },
        }
      : {}),
    ...(startGte || startLte
      ? {
          startAt: {
            ...(startGte ? { gte: startGte } : {}),
            ...(startLte ? { lte: startLte } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        type: { select: { name: true, slug: true } },
        mode: { select: { name: true, slug: true } },
        level: { select: { id: true, name: true, slug: true } },
        status: { select: { code: true, name: true } },
        organizer: { select: { id: true, name: true, email: true } },
        _count: { select: { registrations: { where: { status: { code: 'REGISTERED' } } } } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    items: items.map(mapEventItem),
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
}

export async function getEventByIdOrSlug(identifier: string, userId?: string) {
  await syncEventLifecycleStatuses();

  const event = await prisma.event.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      status: { code: { not: 'DRAFT' } }, // Only allow public events
    },
    include: {
      type: { select: { name: true, slug: true } },
      mode: { select: { name: true, slug: true } },
      level: { select: { id: true, name: true, slug: true } },
      status: { select: { code: true, name: true } },
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { registrations: { where: { status: { code: 'REGISTERED' } } } } },
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  let isRegistered = false;
  if (userId) {
    const existingReg = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId: event.id, userId },
      },
    });
    if (existingReg) isRegistered = true;
  }

  return { ...mapEventItem(event), isRegistered };
}

export async function getManagementEventById(actor: AuthActor, eventId: string) {
  await syncEventLifecycleStatuses();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      ...(actor.role === 'ORGANIZER' ? { organizerId: actor.userId } : {}),
    },
    include: {
      type: { select: { name: true, slug: true } },
      mode: { select: { name: true, slug: true } },
      level: { select: { id: true, name: true, slug: true } },
      status: { select: { code: true, name: true } },
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { registrations: { where: { status: { code: 'REGISTERED' } } } } },
    },
  });

  if (!event) {
    throw new Error('Event not found or inaccessible');
  }

  return mapEventItem(event);
}

export async function createManagementEvent(actor: AuthActor, input: ManagementEventPayload) {
  const validated = await validateAndNormalizeEventPayload(input);

  const slug = await generateUniqueEventSlug(validated.title);

  const event = await prisma.event.create({
    data: {
      title: validated.title,
      slug,
      description: validated.description,
      imageUrl: validated.imageUrl,
      meetLink: validated.meetLink,
      typeId: validated.typeId,
      modeId: validated.modeId,
      levelId: validated.levelId,
      statusId: validated.statusId,
      organizerId: actor.userId,
      startAt: validated.startAt,
      endAt: validated.endAt,
      registrationOpenAt: validated.registrationOpenAt,
      registrationCloseAt: validated.registrationCloseAt,
      timezone: validated.timezone,
      capacity: validated.capacity,
      isFree: validated.isFree,
      price: validated.price,
      formSchema: validated.formSchema ? (validated.formSchema as any) : null,
    },
    include: {
      type: { select: { name: true, slug: true } },
      mode: { select: { name: true, slug: true } },
      level: { select: { id: true, name: true, slug: true } },
      status: { select: { code: true, name: true } },
      organizer: { select: { id: true, name: true, email: true } },
    },
  });

  return mapEventItem(event);
}

export async function updateManagementEvent(actor: AuthActor, eventId: string, input: ManagementEventPayload) {
  const existing = await prisma.event.findFirst({
    where: {
      id: eventId,
      ...(actor.role === 'ORGANIZER' ? { organizerId: actor.userId } : {}),
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!existing) {
    throw new Error('Event not found or inaccessible');
  }

  const validated = await validateAndNormalizeEventPayload(input);

  const slug = validated.title === existing.title ? undefined : await generateUniqueEventSlug(validated.title, eventId);

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: validated.title,
      ...(slug ? { slug } : {}),
      description: validated.description,
      imageUrl: validated.imageUrl,
      meetLink: validated.meetLink,
      typeId: validated.typeId,
      modeId: validated.modeId,
      levelId: validated.levelId,
      statusId: validated.statusId,
      startAt: validated.startAt,
      endAt: validated.endAt,
      registrationOpenAt: validated.registrationOpenAt,
      registrationCloseAt: validated.registrationCloseAt,
      timezone: validated.timezone,
      capacity: validated.capacity,
      isFree: validated.isFree,
      price: validated.price,
      formSchema: validated.formSchema !== undefined ? (validated.formSchema ? (validated.formSchema as any) : null) : undefined,
    },
    include: {
      type: { select: { name: true, slug: true } },
      mode: { select: { name: true, slug: true } },
      level: { select: { id: true, name: true, slug: true } },
      status: { select: { code: true, name: true } },
      organizer: { select: { id: true, name: true, email: true } },
    },
  });

  return mapEventItem(event);
}

export async function deleteManagementEvent(actor: AuthActor, eventId: string) {
  const deleted = await prisma.event.deleteMany({
    where: {
      id: eventId,
      ...(actor.role === 'ORGANIZER' ? { organizerId: actor.userId } : {}),
    },
  });

  if (deleted.count === 0) {
    throw new Error('Event not found or inaccessible');
  }
}

export async function getEventMasterData() {
  const [types, topics, modes, levels, statuses, registrationStatuses] = await prisma.$transaction([
    prisma.eventType.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    prisma.eventTopic.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    prisma.eventMode.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    prisma.eventLevel.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    prisma.eventStatus.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }] }),
    prisma.registrationStatus.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }] }),
  ]);

  return {
    types,
    topics,
    modes,
    levels,
    eventStatuses: statuses,
    registrationStatuses,
  };
}

export async function listManagementMasterData(kind: MasterDataKind, input: ListMasterDataQuery) {
  const search = normalizeSearchTerm(input.q);
  const pagination = normalizePagination({ page: input.page, limit: input.limit });

  if (kind === 'types') {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [rows, total] = await prisma.$transaction([
      prisma.eventType.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.eventType.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        code: null,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      pagination: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
    };
  }

  if (kind === 'topics') {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [rows, total] = await prisma.$transaction([
      prisma.eventTopic.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.eventTopic.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        code: null,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      pagination: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
    };
  }

  if (kind === 'modes') {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [rows, total] = await prisma.$transaction([
      prisma.eventMode.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.eventMode.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        code: null,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      pagination: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
    };
  }

  if (kind === 'levels') {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [rows, total] = await prisma.$transaction([
      prisma.eventLevel.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.eventLevel.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        code: null,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      pagination: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
    };
  }

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.eventStatus.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.eventStatus.count({ where }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: null,
      code: row.code,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    pagination: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
  };
}

export async function createManagementMasterData(kind: MasterDataKind, input: MasterDataPayload) {
  const name = normalizeName(input.name);
  const isActive = input.isActive ?? true;
  const sortOrder = normalizeSortOrder(input.sortOrder);

  if (!name) {
    throw new Error('Name is required');
  }

  if (kind === 'types') {
    const slug = normalizeSlug(input.slug);
    if (!slug) throw new Error('Slug is required for this master data type');
    assertSlugFormat(slug);
    return prisma.eventType.create({ data: { name, slug, isActive, sortOrder } });
  }

  if (kind === 'topics') {
    const slug = normalizeSlug(input.slug);
    if (!slug) throw new Error('Slug is required for this master data type');
    assertSlugFormat(slug);
    return prisma.eventTopic.create({ data: { name, slug, isActive, sortOrder } });
  }

  if (kind === 'modes') {
    const slug = normalizeSlug(input.slug);
    if (!slug) throw new Error('Slug is required for this master data type');
    assertSlugFormat(slug);
    return prisma.eventMode.create({ data: { name, slug, isActive, sortOrder } });
  }

  if (kind === 'levels') {
    const slug = normalizeSlug(input.slug);
    if (!slug) throw new Error('Slug is required for this master data type');
    assertSlugFormat(slug);
    return prisma.eventLevel.create({ data: { name, slug, isActive, sortOrder } });
  }

  const code = normalizeCode(input.code);
  if (!code) throw new Error('Code is required for status master data');
  assertCodeFormat(code);
  return prisma.eventStatus.create({ data: { code, name, isActive, sortOrder } });
}

export async function updateManagementMasterData(kind: MasterDataKind, id: string, input: MasterDataPayload) {
  const name = normalizeName(input.name);
  const sortOrder = normalizeSortOrder(input.sortOrder);
  const isActive = input.isActive;

  const baseData = {
    ...(name ? { name } : {}),
    ...(typeof isActive === 'boolean' ? { isActive } : {}),
    ...(typeof input.sortOrder === 'number' ? { sortOrder } : {}),
  };

  if (kind === 'types') {
    const nextSlug = input.slug ? normalizeSlug(input.slug) : undefined;
    if (nextSlug) {
      assertSlugFormat(nextSlug);
    }
    return prisma.eventType.update({
      where: { id },
      data: {
        ...baseData,
        ...(nextSlug ? { slug: nextSlug } : {}),
      },
    });
  }

  if (kind === 'topics') {
    const nextSlug = input.slug ? normalizeSlug(input.slug) : undefined;
    if (nextSlug) {
      assertSlugFormat(nextSlug);
    }
    return prisma.eventTopic.update({
      where: { id },
      data: {
        ...baseData,
        ...(nextSlug ? { slug: nextSlug } : {}),
      },
    });
  }

  if (kind === 'modes') {
    const nextSlug = input.slug ? normalizeSlug(input.slug) : undefined;
    if (nextSlug) {
      assertSlugFormat(nextSlug);
    }
    return prisma.eventMode.update({
      where: { id },
      data: {
        ...baseData,
        ...(nextSlug ? { slug: nextSlug } : {}),
      },
    });
  }

  if (kind === 'levels') {
    const nextSlug = input.slug ? normalizeSlug(input.slug) : undefined;
    if (nextSlug) {
      assertSlugFormat(nextSlug);
    }
    return prisma.eventLevel.update({
      where: { id },
      data: {
        ...baseData,
        ...(nextSlug ? { slug: nextSlug } : {}),
      },
    });
  }

  const nextCode = input.code ? normalizeCode(input.code) : undefined;
  if (nextCode) {
    assertCodeFormat(nextCode);
  }

  return prisma.eventStatus.update({
    where: { id },
    data: {
      ...baseData,
      ...(nextCode ? { code: nextCode } : {}),
    },
  });
}

export async function deleteManagementMasterData(kind: MasterDataKind, id: string) {
  if (kind === 'types') {
    await prisma.eventType.delete({ where: { id } });
    return;
  }

  if (kind === 'topics') {
    await prisma.eventTopic.delete({ where: { id } });
    return;
  }

  if (kind === 'modes') {
    await prisma.eventMode.delete({ where: { id } });
    return;
  }

  if (kind === 'levels') {
    await prisma.eventLevel.delete({ where: { id } });
    return;
  }

  await prisma.eventStatus.delete({ where: { id } });
}

export type RegisterEventPayload = {
  customAnswers?: any | null;
  paymentProofUrl?: string | null;
};

export async function registerForEvent(actor: AuthActor, eventId: string, payload: RegisterEventPayload) {
  const event = await prisma.event.findFirst({
    where: { OR: [{ id: eventId }, { slug: eventId }] },
    include: {
      status: true,
      _count: {
        select: { registrations: { where: { status: { code: 'REGISTERED' } } } }
      }
    }
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.status.code !== 'PUBLISHED') {
    throw new Error('Event is not open for registration');
  }

  const now = new Date();
  if (event.registrationOpenAt && event.registrationOpenAt > now) {
    throw new Error('Registration is not open yet');
  }

  if (event.registrationCloseAt && event.registrationCloseAt < now) {
    throw new Error('Registration is closed');
  }

  if (event.capacity && event._count.registrations >= event.capacity) {
    throw new Error('Event capacity is full');
  }

  if (!event.isFree) {
    if (!payload.paymentProofUrl) {
      throw new Error('Payment proof is required for paid events');
    }
  }

  const registeredStatus = await prisma.registrationStatus.findFirst({
    where: { code: 'REGISTERED' }
  });

  if (!registeredStatus) {
    throw new Error('Registration status REGISTERED not found');
  }

  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: actor.userId,
      }
    }
  });

  if (existingRegistration) {
    throw new Error('You have already registered for this event');
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      userId: actor.userId,
      statusId: registeredStatus.id,
      customAnswers: payload.customAnswers ? (payload.customAnswers as any) : undefined,
      paymentProofUrl: payload.paymentProofUrl ?? null,
      paymentStatus: event.isFree ? 'FREE' : 'WAITING_VERIFICATION',
    }
  });

  return {
    id: registration.id,
    eventId: registration.eventId,
    userId: registration.userId,
    statusId: registration.statusId,
    paymentStatus: registration.paymentStatus,
    paymentProofUrl: registration.paymentProofUrl,
    createdAt: registration.createdAt.toISOString(),
  };
}

export async function getMyEvents(actor: AuthActor, input: ListMyEventsQuery = {}) {
  const search = normalizeSearchTerm(input.q);
  const pagination = normalizePagination({ page: input.page, limit: input.limit });
  const statusCode = normalizeCode(input.statusCode);
  const paymentStatus = normalizeCode(input.paymentStatus);
  const typeSlug = normalizeSlug(input.typeSlug);
  const modeSlug = normalizeSlug(input.modeSlug);

  const andFilters: Array<Record<string, unknown>> = [];

  if (typeSlug) {
    andFilters.push({ event: { type: { slug: typeSlug } } });
  }

  if (modeSlug) {
    andFilters.push({ event: { mode: { slug: modeSlug } } });
  }

  const where = {
    userId: actor.userId,
    ...(statusCode ? { status: { code: statusCode } } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    ...(search
      ? {
          OR: [
            { event: { title: { contains: search, mode: 'insensitive' as const } } },
            { event: { description: { contains: search, mode: 'insensitive' as const } } },
            { event: { type: { name: { contains: search, mode: 'insensitive' as const } } } },
            { event: { mode: { name: { contains: search, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
  };

  const [registrations, total] = await prisma.$transaction([
    prisma.eventRegistration.findMany({
      where,
      include: {
        event: {
          include: {
            type: { select: { name: true, slug: true } },
            mode: { select: { name: true, slug: true } },
            level: { select: { id: true, name: true, slug: true } },
            status: { select: { code: true, name: true } },
            organizer: { select: { id: true, name: true, email: true } },
            _count: { select: { registrations: { where: { status: { code: 'REGISTERED' } } } } },
          }
        },
        status: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return {
    items: registrations.map((reg) => ({
      registrationId: reg.id,
      status: reg.status.name,
      statusCode: reg.status.code,
      paymentStatus: reg.paymentStatus,
      registeredAt: reg.createdAt.toISOString(),
      event: mapEventItem(reg.event),
    })),
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
}

export async function getEventRegistrations(actor: AuthActor, eventId: string) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      ...(actor.role === 'ORGANIZER' ? { organizerId: actor.userId } : {}),
    }
  });

  if (!event) {
    throw new Error('Event not found or you do not have permission');
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      status: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return registrations.map(reg => ({
    id: reg.id,
    user: reg.user,
    status: reg.status.name,
    statusCode: reg.status.code,
    paymentStatus: reg.paymentStatus,
    paymentProofUrl: reg.paymentProofUrl,
    customAnswers: reg.customAnswers,
    createdAt: reg.createdAt.toISOString(),
  }));
}

export async function updateRegistrationStatus(actor: AuthActor, eventId: string, registrationId: string, payload: { statusCode?: string; paymentStatus?: string }) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      ...(actor.role === 'ORGANIZER' ? { organizerId: actor.userId } : {}),
    }
  });

  if (!event) {
    throw new Error('Event not found or you do not have permission');
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId }
  });

  if (!registration || registration.eventId !== eventId) {
    throw new Error('Registration not found');
  }

  const updateData: any = {};

  if (payload.statusCode) {
    const status = await prisma.registrationStatus.findFirst({
      where: { code: payload.statusCode }
    });
    if (!status) throw new Error('Invalid status code');
    updateData.statusId = status.id;
  }

  if (payload.paymentStatus) {
    updateData.paymentStatus = payload.paymentStatus;
  }

  const updated = await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: updateData,
    include: {
      status: true,
      user: { select: { id: true, name: true, email: true } },
    }
  });

  return {
    id: updated.id,
    user: updated.user,
    status: updated.status.name,
    statusCode: updated.status.code,
    paymentStatus: updated.paymentStatus,
    paymentProofUrl: updated.paymentProofUrl,
    createdAt: updated.createdAt.toISOString(),
  };
}

export type EventSectionPayload = {
  title: string;
  order?: number;
  isActive?: boolean;
};

export type EventMaterialPayload = {
  title: string;
  type: 'ARTICLE' | 'VIDEO' | 'DOCUMENT' | 'QUIZ';
  content?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  durationMin?: number | null;
  isPreview?: boolean;
  order?: number;
};

async function verifyEventOwnership(actor: AuthActor, eventId: string) {
  if (actor.role === 'ADMIN') return true;
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: actor.userId },
    select: { id: true },
  });
  if (!event) throw new Error('Event not found or inaccessible');
  return true;
}

export async function createEventSection(actor: AuthActor, eventId: string, payload: EventSectionPayload) {
  await verifyEventOwnership(actor, eventId);
  return prisma.eventSection.create({
    data: {
      eventId,
      title: payload.title,
      order: payload.order ?? 0,
      isActive: payload.isActive ?? true,
    },
  });
}

export async function updateEventSection(actor: AuthActor, eventId: string, sectionId: string, payload: EventSectionPayload) {
  await verifyEventOwnership(actor, eventId);
  const existing = await prisma.eventSection.findFirst({ where: { id: sectionId, eventId } });
  if (!existing) throw new Error('Section not found');

  return prisma.eventSection.update({
    where: { id: sectionId },
    data: {
      title: payload.title,
      order: payload.order,
      isActive: payload.isActive,
    },
  });
}

export async function deleteEventSection(actor: AuthActor, eventId: string, sectionId: string) {
  await verifyEventOwnership(actor, eventId);
  const deleted = await prisma.eventSection.deleteMany({
    where: { id: sectionId, eventId },
  });
  if (deleted.count === 0) throw new Error('Section not found');
}

export async function createEventMaterial(actor: AuthActor, eventId: string, sectionId: string, payload: EventMaterialPayload) {
  await verifyEventOwnership(actor, eventId);
  const section = await prisma.eventSection.findFirst({ where: { id: sectionId, eventId } });
  if (!section) throw new Error('Section not found');

  return prisma.eventMaterial.create({
    data: {
      sectionId,
      title: payload.title,
      type: payload.type,
      content: payload.content,
      videoUrl: payload.videoUrl,
      fileUrl: payload.fileUrl,
      durationMin: payload.durationMin,
      isPreview: payload.isPreview ?? false,
      order: payload.order ?? 0,
    },
  });
}

export async function updateEventMaterial(actor: AuthActor, eventId: string, materialId: string, payload: EventMaterialPayload) {
  await verifyEventOwnership(actor, eventId);
  const existing = await prisma.eventMaterial.findFirst({
    where: { id: materialId, section: { eventId } },
  });
  if (!existing) throw new Error('Material not found');

  return prisma.eventMaterial.update({
    where: { id: materialId },
    data: {
      title: payload.title,
      type: payload.type,
      content: payload.content,
      videoUrl: payload.videoUrl,
      fileUrl: payload.fileUrl,
      durationMin: payload.durationMin,
      isPreview: payload.isPreview,
      order: payload.order,
    },
  });
}

export async function deleteEventMaterial(actor: AuthActor, eventId: string, materialId: string) {
  await verifyEventOwnership(actor, eventId);
  const existing = await prisma.eventMaterial.findFirst({
    where: { id: materialId, section: { eventId } },
  });
  if (!existing) throw new Error('Material not found');

  await prisma.eventMaterial.delete({
    where: { id: materialId },
  });
}

export async function getEventSyllabus(
  eventId: string,
  userId?: string,
  showInactive = false,
  page = 1,
  limit = 20,
) {
  let isAuthorized = false;
  let isOwner = false;

  if (userId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: userId },
      select: { id: true },
    });

    if (event) {
      isAuthorized = true;
      isOwner = true;
    } else {
      const registration = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
        select: { status: { select: { code: true } }, paymentStatus: true },
      });

      if (registration && registration.status.code === 'REGISTERED' && (registration.paymentStatus === 'PAID' || registration.paymentStatus === 'FREE')) {
        isAuthorized = true;
      }
    }
  }

  // Get total sections count
  const totalSections = await prisma.eventSection.count({
    where: {
      eventId,
      ...(isOwner || showInactive ? {} : { isActive: true }),
    },
  });

  const totalPages = Math.ceil(totalSections / limit);

  // Get paginated sections
  const sections = await prisma.eventSection.findMany({
    where: {
      eventId,
      ...(isOwner || showInactive ? {} : { isActive: true }),
    },
    orderBy: { order: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      materials: {
        orderBy: { order: 'asc' },
      },
    },
  });

  const progressMap = new Map<string, any>();
  if (userId) {
    const userProgress = await prisma.materialProgress.findMany({
      where: { userId, material: { section: { eventId } } },
    });
    for (const p of userProgress) {
      progressMap.set(p.materialId, {
        isCompleted: p.isCompleted,
        completedAt: p.completedAt ? p.completedAt.toISOString() : null,
      });
    }
  }

  const mappedSections = sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    order: sec.order,
    materials: sec.materials.map((mat) => {
      const masked = !isAuthorized && !mat.isPreview;
      return {
        id: mat.id,
        title: mat.title,
        type: mat.type,
        durationMin: mat.durationMin,
        isPreview: mat.isPreview,
        order: mat.order,
        content: masked ? null : mat.content,
        videoUrl: masked ? null : mat.videoUrl,
        fileUrl: masked ? null : mat.fileUrl,
        userProgress: progressMap.get(mat.id) || null,
      };
    }),
  }));

  return {
    sections: mappedSections,
    pagination: buildPaginationMeta({ page, limit, total: totalSections }),
  };
}

export async function markMaterialAsCompleted(actor: AuthActor, materialId: string) {
  const material = await prisma.eventMaterial.findUnique({
    where: { id: materialId },
    include: { section: true }
  });

  if (!material) throw new Error('Material not found');

  if (actor.role !== 'ADMIN') {
    const event = await prisma.event.findFirst({
      where: { id: material.section.eventId, organizerId: actor.userId },
      select: { id: true },
    });
    
    if (!event) {
      const registration = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: material.section.eventId, userId: actor.userId } },
        select: { status: { select: { code: true } }, paymentStatus: true },
      });
      if (!registration || registration.status.code !== 'REGISTERED' || (registration.paymentStatus !== 'PAID' && registration.paymentStatus !== 'FREE')) {
        throw new Error('Not authorized to access this material');
      }
    }
  }

  return prisma.materialProgress.upsert({
    where: {
      userId_materialId: { userId: actor.userId, materialId }
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId: actor.userId,
      materialId,
      isCompleted: true,
      completedAt: new Date(),
    }
  });
}

export async function unmarkMaterialAsCompleted(actor: AuthActor, materialId: string) {
  await prisma.materialProgress.deleteMany({
    where: { userId: actor.userId, materialId }
  });
}

export async function reorderEventSections(actor: AuthActor, eventId: string, sectionIds: string[]) {
  await verifyEventOwnership(actor, eventId);

  const updates = sectionIds.map((id, index) =>
    prisma.eventSection.update({
      where: { id },
      data: { order: index },
    })
  );

  await prisma.$transaction(updates);
}

export async function reorderEventMaterials(actor: AuthActor, eventId: string, sectionId: string, materialIds: string[]) {
  await verifyEventOwnership(actor, eventId);

  const section = await prisma.eventSection.findFirst({ where: { id: sectionId, eventId } });
  if (!section) throw new Error('Section not found');

  const updates = materialIds.map((id, index) =>
    prisma.eventMaterial.update({
      where: { id, sectionId },
      data: { order: index },
    })
  );

  await prisma.$transaction(updates);
}
