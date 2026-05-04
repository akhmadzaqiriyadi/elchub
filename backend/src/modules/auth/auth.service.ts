import { createHash } from 'node:crypto';
import { randomBytes } from 'node:crypto';

import { env } from '../../config/env';
import { verifyAccessToken } from '../../lib/auth';
import { comparePassword, createAccessToken, hashPassword } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../lib/rbac';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../lib/mailer';
import { authLoginSchema, authRegisterSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';

export type PublicUser = {
  id: string;
  name: string | null;
  profilePhotoUrl: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

function toPublicUser(user: {
  id: string;
  name: string | null;
  profilePhotoUrl: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    profilePhotoUrl: user.profilePhotoUrl,
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
        message: 'Email is already registered',
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
        message: 'Invalid email or password',
      },
    };
  }

  const passwordValid = await comparePassword(data.password, user.passwordHash);

  if (!passwordValid) {
    return {
      status: 401,
      body: {
        success: false,
        message: 'Invalid email or password',
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
  const sessionResult = await requireAuth(headers);

  if (!sessionResult.ok) {
    return {
      status: sessionResult.status,
      body: sessionResult.body,
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: toPublicUser(sessionResult.user),
        appUrl: env.APP_URL,
      },
    },
  };
}

function normalizeName(value?: string | null) {
  if (value === undefined) return undefined;
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateAuthenticatedUserProfile(
  headers: Record<string, string | undefined>,
  input: { name?: string | null },
) {
  const sessionResult = await requireAuth(headers);

  if (!sessionResult.ok) {
    return {
      status: sessionResult.status,
      body: sessionResult.body,
    };
  }

  const name = normalizeName(input.name);

  const user = await prisma.user.update({
    where: { id: sessionResult.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
    },
  });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: toPublicUser(user),
      },
    },
  };
}

export async function updateAuthenticatedUserProfilePhoto(
  headers: Record<string, string | undefined>,
  profilePhotoUrl: string,
) {
  const sessionResult = await requireAuth(headers);

  if (!sessionResult.ok) {
    return {
      status: sessionResult.status,
      body: sessionResult.body,
    };
  }

  const user = await prisma.user.update({
    where: { id: sessionResult.user.id },
    data: { profilePhotoUrl },
  });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: toPublicUser(user),
      },
    },
  };
}

export async function changeAuthenticatedUserPassword(
  headers: Record<string, string | undefined>,
  input: { currentPassword: string; newPassword: string },
) {
  const sessionResult = await requireAuth(headers);

  if (!sessionResult.ok) {
    return {
      status: sessionResult.status,
      body: sessionResult.body,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionResult.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return {
      status: 404,
      body: {
        success: false,
        message: 'User not found',
      },
    };
  }

  const passwordMatched = await comparePassword(input.currentPassword, user.passwordHash);

  if (!passwordMatched) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'Current password is incorrect',
      },
    };
  }

  if (input.currentPassword === input.newPassword) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'New password must be different from current password',
      },
    };
  }

  const newPasswordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.session.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
        NOT: { refreshTokenHash: sessionResult.tokenHash },
      },
      data: { revokedAt: new Date() },
    }),
  ]);

  return {
    status: 200,
    body: {
      success: true,
      message: 'Password changed successfully',
    },
  };
}

export async function logoutUser(headers: Record<string, string | undefined>) {
  const sessionResult = await requireAuth(headers);

  if (!sessionResult.ok) {
    return {
      status: sessionResult.status,
      body: sessionResult.body,
    };
  }

  await prisma.session.updateMany({
    where: {
      userId: sessionResult.user.id,
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
      message: 'Logged out successfully',
    },
  };
}

export async function requestPasswordReset(input: unknown) {
  const data = forgotPasswordSchema.parse(input);

  const genericSuccess = {
    status: 200,
    body: {
      success: true,
      message: 'If that email is registered, a reset link has been sent',
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
        message: 'Reset token is invalid or expired',
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
      message: 'Password reset successfully',
    },
  };
}