import { createHash } from 'node:crypto';
import { randomBytes } from 'node:crypto';

import { env } from '../../config/env';
import { verifyAccessToken } from '../../lib/auth';
import { comparePassword, createAccessToken, hashPassword } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../lib/mailer';
import { authLoginSchema, authRegisterSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';

export type PublicUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

function toPublicUser(user: {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  } satisfies PublicUser;
}

function hashAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function createAccessSession(userId: string, accessToken: string) {
  const verifiedToken = await verifyAccessToken(accessToken);
  const expiresAt =
    typeof verifiedToken.payload.exp === 'number'
      ? new Date(verifiedToken.payload.exp * 1000)
      : new Date(Date.now() + 15 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: hashAccessToken(accessToken),
      expiresAt,
    },
  });
}

async function resolveAuthorizedSession(headers: Record<string, string | undefined>) {
  const authorizationHeader = headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return {
      ok: false as const,
      status: 401,
      body: {
        success: false,
        message: 'Token otorisasi tidak ditemukan',
      },
    };
  }

  const token = authorizationHeader.slice('Bearer '.length);
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
        ok: false as const,
        status: 401,
        body: {
          success: false,
          message: 'Token otorisasi sudah kedaluwarsa',
        },
      };
    }

    return {
      ok: false as const,
      status: 401,
      body: {
        success: false,
        message: 'Token otorisasi tidak valid',
      },
    };
  }

  const userId = verifiedToken.payload.sub;

  if (!userId) {
    return {
      ok: false as const,
      status: 401,
      body: {
        success: false,
        message: 'Token otorisasi tidak valid',
      },
    };
  }

  const session = await prisma.session.findFirst({
    where: {
      userId,
      refreshTokenHash: hashAccessToken(token),
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!session) {
    return {
      ok: false as const,
      status: 401,
      body: {
        success: false,
        message: 'Sesi tidak valid atau sudah kedaluwarsa',
      },
    };
  }

  return {
    ok: true as const,
    token,
    userId,
    tokenHash: hashAccessToken(token),
  };
}

export async function registerUser(input: unknown) {
  const data = authRegisterSchema.parse(input);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    return {
      status: 409,
      body: {
        success: false,
        message: 'Email sudah terdaftar',
      },
    };
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email,
      passwordHash,
    },
  });

  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await createAccessSession(user.id, accessToken);

  void sendWelcomeEmail({
    to: user.email,
    name: user.name || user.email,
  });

  return {
    status: 201,
    body: {
      success: true,
      data: {
        user: toPublicUser(user),
        accessToken,
      },
    },
  };
}

export async function loginUser(input: unknown) {
  const data = authLoginSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return {
      status: 401,
      body: {
        success: false,
        message: 'Email atau password tidak valid',
      },
    };
  }

  const passwordValid = await comparePassword(data.password, user.passwordHash);

  if (!passwordValid) {
    return {
      status: 401,
      body: {
        success: false,
        message: 'Email atau password tidak valid',
      },
    };
  }

  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await createAccessSession(user.id, accessToken);

  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: toPublicUser(user),
        accessToken,
      },
    },
  };
}

export async function getAuthenticatedUser(headers: Record<string, string | undefined>) {
  const sessionResult = await resolveAuthorizedSession(headers);

  if (!sessionResult.ok) {
    return {
      status: sessionResult.status,
      body: sessionResult.body,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionResult.userId },
  });

  if (!user) {
    return {
      status: 404,
      body: {
        success: false,
        message: 'Pengguna tidak ditemukan',
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: toPublicUser(user),
        appUrl: env.APP_URL,
      },
    },
  };
}

export async function logoutUser(headers: Record<string, string | undefined>) {
  const sessionResult = await resolveAuthorizedSession(headers);

  if (!sessionResult.ok) {
    return {
      status: sessionResult.status,
      body: sessionResult.body,
    };
  }

  await prisma.session.updateMany({
    where: {
      userId: sessionResult.userId,
      refreshTokenHash: sessionResult.tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return {
    status: 200,
    body: {
      success: true,
      message: 'Berhasil logout',
    },
  };
}

export async function requestPasswordReset(input: unknown) {
  const data = forgotPasswordSchema.parse(input);

  const genericSuccess = {
    status: 200,
    body: {
      success: true,
      message: 'Jika email terdaftar, tautan reset password sudah dikirim',
    },
  } as const;

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return genericSuccess;
  }

  const resetToken = randomBytes(32).toString('hex');
  const resetTokenHash = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: resetTokenHash,
      expiresAt,
    },
  });

  const resetLink = `${env.FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(resetToken)}`;

  void sendPasswordResetEmail({
    to: user.email,
    name: user.name || user.email,
    resetLink,
  });

  return genericSuccess;
}

export async function resetPassword(input: unknown) {
  const data = resetPasswordSchema.parse(input);
  const tokenHash = hashResetToken(data.token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!resetToken) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'Token reset tidak valid atau sudah kedaluwarsa',
      },
    };
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.session.updateMany({
      where: {
        userId: resetToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);

  return {
    status: 200,
    body: {
      success: true,
      message: 'Password berhasil direset',
    },
  };
}