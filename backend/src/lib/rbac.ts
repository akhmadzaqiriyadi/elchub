import { createHash } from 'node:crypto';

import type { UserRole } from '@prisma/client';

import { verifyAccessToken } from './auth';
import { prisma } from './prisma';

type AuthError = {
  ok: false;
  status: 401 | 403;
  body: {
    success: false;
    message: string;
  };
};

type AuthSuccess = {
  ok: true;
  user: {
    id: string;
    email: string;
    role: UserRole;
    name: string | null;
    profilePhotoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  tokenHash: string;
};

export type AuthResult = AuthError | AuthSuccess;

function hashAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function requireAuth(headers: Record<string, string | undefined>): Promise<AuthResult> {
  const authorizationHeader = headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      body: {
        success: false,
        message: 'Token not found in Authorization header',
      },
    };
  }

  const token = authorizationHeader.slice('Bearer '.length);
  const tokenHash = hashAccessToken(token);

  let verifiedToken: Awaited<ReturnType<typeof verifyAccessToken>>;

  try {
    verifiedToken = await verifyAccessToken(token);
  } catch (error) {
    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : undefined;

    if (errorCode === 'ERR_JWT_EXPIRED') {
      return {
        ok: false,
        status: 401,
        body: {
          success: false,
          message: 'Authorization token expired',
        },
      };
    }

    return {
      ok: false,
      status: 401,
      body: {
        success: false,
        message: 'Authorization token is invalid',
      },
    };
  }

  const userId = verifiedToken.payload.sub;

  if (!userId) {
    return {
      ok: false,
      status: 401,
      body: {
        success: false,
        message: 'Authorization token is invalid',
      },
    };
  }

  const session = await prisma.session.findFirst({
    where: {
      userId,
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!session) {
    return {
      ok: false,
      status: 401,
      body: {
        success: false,
        message: 'Session is invalid or expired',
      },
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      profilePhotoUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return {
      ok: false,
      status: 401,
      body: {
        success: false,
        message: 'User is inactive or not found',
      },
    };
  }

  return {
    ok: true,
    user,
    tokenHash,
  };
}

export async function requireRole(
  headers: Record<string, string | undefined>,
  allowedRoles: UserRole[],
): Promise<AuthResult> {
  const authResult = await requireAuth(headers);

  if (!authResult.ok) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    return {
      ok: false,
      status: 403,
      body: {
        success: false,
        message: 'Access denied for current role',
      },
    };
  }

  return authResult;
}