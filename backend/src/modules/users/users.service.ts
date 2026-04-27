import { UserRole } from '@prisma/client';

import { hashPassword } from '../../lib/auth';
import { buildPaginationMeta, normalizePagination, normalizeSearchTerm } from '../../lib/list-query';
import { prisma } from '../../lib/prisma';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListUsersQuery = {
  q?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type CreateUserPayload = {
  name?: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeName(value?: string) {
  return value?.trim() || null;
}

function isValidRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

function mapUserItem(user: {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// List users (with search, filter, pagination)
// ---------------------------------------------------------------------------

export async function listUsers(input: ListUsersQuery) {
  const search = normalizeSearchTerm(input.q);
  const pagination = normalizePagination({ page: input.page, limit: input.limit });

  // Validate role filter
  const roleFilter =
    input.role && isValidRole(input.role) ? (input.role as UserRole) : undefined;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: items.map(mapUserItem),
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
}

// ---------------------------------------------------------------------------
// Get user by ID
// ---------------------------------------------------------------------------

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return mapUserItem(user);
}

// ---------------------------------------------------------------------------
// Create user
// ---------------------------------------------------------------------------

export async function createUser(input: CreateUserPayload) {
  const email = normalizeEmail(input.email);
  const name = normalizeName(input.name);

  if (!email) throw new Error('Email is required');
  if (!input.password || input.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // Check role validity
  const role: UserRole =
    input.role && isValidRole(input.role) ? input.role : UserRole.USER;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      isActive: input.isActive ?? true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return mapUserItem(user);
}

// ---------------------------------------------------------------------------
// Update user
// ---------------------------------------------------------------------------

export async function updateUser(userId: string, input: UpdateUserPayload) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new Error('User not found');
  }

  // Check email uniqueness if changing
  if (input.email) {
    const normalized = normalizeEmail(input.email);
    const emailConflict = await prisma.user.findFirst({
      where: {
        email: normalized,
        id: { not: userId },
      },
    });

    if (emailConflict) {
      throw new Error('Email is already used by another user');
    }
  }

  // Validate new role if present
  if (input.role && !isValidRole(input.role)) {
    throw new Error('Invalid role value');
  }

  // Validate password if changing
  if (input.password !== undefined && input.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: normalizeName(input.name) } : {}),
      ...(input.email ? { email: normalizeEmail(input.email) } : {}),
      ...(passwordHash ? { passwordHash } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return mapUserItem(user);
}

// ---------------------------------------------------------------------------
// Delete user
// ---------------------------------------------------------------------------

export async function deleteUser(userId: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new Error('User not found');
  }

  await prisma.user.delete({ where: { id: userId } });
}
