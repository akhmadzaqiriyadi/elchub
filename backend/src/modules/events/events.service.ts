import { prisma } from '../../lib/prisma';
import { buildPaginationMeta, normalizePagination, normalizeSearchTerm } from '../../lib/list-query';

export type ListEventsQuery = {
  q?: string;
  typeSlug?: string;
  modeSlug?: string;
  statusCode?: string;
  organizerId?: string;
  page?: number;
  limit?: number;
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
  type: { name: string; slug: string };
  mode: { name: string; slug: string };
  status: { code: string; name: string };
  level: { id: string; name: string; slug: string } | null;
  organizer: { id: string; name: string | null; email: string };
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
    type: item.type,
    mode: item.mode,
    level: item.level,
    status: item.status,
    organizer: item.organizer,
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
    ...(input.statusCode ? { status: { code: input.statusCode } } : {}),
    ...(input.organizerId ? { organizerId: input.organizerId } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        type: { select: { name: true, slug: true } },
        mode: { select: { name: true, slug: true } },
        level: { select: { id: true, name: true, slug: true } },
        status: { select: { code: true, name: true } },
        organizer: { select: { id: true, name: true, email: true } },
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
