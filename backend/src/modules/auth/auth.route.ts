import { Elysia, t } from 'elysia';

import { logger } from '../../lib/logger';
import { getAuthenticatedUser, loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword } from './auth.service';

const publicUserSchema = t.Object({
  id: t.String({ examples: ['clx_auth_user_001'] }),
  name: t.Nullable(t.String({ examples: ['System Admin'] })),
  email: t.String({ format: 'email', examples: ['admin@elchub.local'] }),
  role: t.String({ examples: ['ADMIN'] }),
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' }),
});

const authSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    user: publicUserSchema,
    accessToken: t.String({ examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'] }),
  }),
});

const authErrorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
});

const registerBodySchema = t.Object({
  name: t.String({ minLength: 2, maxLength: 80, examples: ['Register Test'] }),
  email: t.String({ format: 'email', examples: ['register@elchub.local'] }),
  password: t.String({ minLength: 8, maxLength: 100, examples: ['Register123!'] }),
});

const loginBodySchema = t.Object({
  email: t.String({ format: 'email', examples: ['admin@elchub.local'] }),
  password: t.String({ minLength: 8, maxLength: 100, examples: ['Admin123!'] }),
});

const meSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    user: publicUserSchema,
    appUrl: t.String({ examples: ['http://localhost:3001'] }),
  }),
});

const logoutSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String({ examples: ['Berhasil logout'] }),
});

const forgotPasswordBodySchema = t.Object({
  email: t.String({ format: 'email', examples: ['user@elchub.local'] }),
});

const forgotPasswordSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String({ examples: ['Jika email terdaftar, tautan reset password sudah dikirim'] }),
});

const resetPasswordBodySchema = t.Object({
  token: t.String({ minLength: 10, maxLength: 200, examples: ['e5fd8a7f...'] }),
  password: t.String({ minLength: 8, maxLength: 100, examples: ['NewPass123!'] }),
});

const resetPasswordSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String({ examples: ['Password berhasil direset'] }),
});

export const authRoute = new Elysia({ name: 'auth-route' })
  .post(
    '/api/auth/register',
    async ({ body, set }) => {
      const result = await registerUser(body);

      set.status = result.status;

      if (result.status === 201) {
        const payload = result.body as {
          data: { user: { email: string } };
        };

        logger.info({ email: payload.data.user.email }, 'user registered');
      }

      return result.body as any;
    },
    {
      body: registerBodySchema,
      response: {
        200: authSuccessSchema,
        201: authSuccessSchema,
        409: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Register user',
        description: 'Create a new user account and return an access token.',
      },
    },
  )
  .post(
    '/api/auth/login',
    async ({ body, set }) => {
      const result = await loginUser(body);

      set.status = result.status;

      if (result.status === 200) {
        const payload = result.body as {
          data: { user: { email: string } };
        };

        logger.info({ email: payload.data.user.email }, 'user logged in');
      }

      return result.body as any;
    },
    {
      body: loginBodySchema,
      response: {
        200: authSuccessSchema,
        401: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticate a user with email and password.',
      },
    },
  )
  .get(
    '/api/auth/me',
    async ({ headers, set }) => {
      const result = await getAuthenticatedUser(headers);

      set.status = result.status;

      return result.body as any;
    },
    {
      response: {
        200: meSuccessSchema,
        401: authErrorSchema,
        404: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Get authenticated user profile using bearer token.',
      },
    },
  )
  .post(
    '/api/auth/logout',
    async ({ headers, set }) => {
      const result = await logoutUser(headers);

      set.status = result.status;

      return result.body as any;
    },
    {
      response: {
        200: logoutSuccessSchema,
        401: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Logout user',
        description: 'Revoke current authenticated session token.',
      },
    },
  )
  .post(
    '/api/auth/forgot-password',
    async ({ body, set }) => {
      const result = await requestPasswordReset(body);

      set.status = result.status;

      return result.body as any;
    },
    {
      body: forgotPasswordBodySchema,
      response: {
        200: forgotPasswordSuccessSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Request password reset',
        description: 'Generate password reset token and send reset link email when account exists.',
      },
    },
  )
  .post(
    '/api/auth/reset-password',
    async ({ body, set }) => {
      const result = await resetPassword(body);

      set.status = result.status;

      return result.body as any;
    },
    {
      body: resetPasswordBodySchema,
      response: {
        200: resetPasswordSuccessSchema,
        400: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Reset password',
        description: 'Reset account password using a valid reset token.',
      },
    },
  );