import { Elysia, t } from 'elysia';

import { logger } from '../../lib/logger';
import { uploadProfilePhoto } from '../../lib/storage';
import {
  changeAuthenticatedUserPassword,
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateAuthenticatedUserProfile,
  updateAuthenticatedUserProfilePhoto,
} from './auth.service';

const publicUserSchema = t.Object({
  id: t.String({ examples: ['clx_auth_user_001'] }),
  name: t.Nullable(t.String({ examples: ['System Admin'] })),
  profilePhotoUrl: t.Nullable(t.String({ examples: ['https://cdn.elchub.local/profiles/user-1.png'] })),
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

const updateProfileBodySchema = t.Object({
  name: t.Optional(t.Nullable(t.String({ maxLength: 120 }))),
});

const updateProfileSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    user: publicUserSchema,
  }),
});

const uploadProfilePhotoSuccessSchema = t.Object({
  success: t.Literal(true),
  data: t.Object({
    imageUrl: t.String(),
    user: publicUserSchema,
  }),
});

const changePasswordBodySchema = t.Object({
  currentPassword: t.String({ minLength: 8, maxLength: 100 }),
  newPassword: t.String({ minLength: 8, maxLength: 100 }),
});

const changePasswordSuccessSchema = t.Object({
  success: t.Literal(true),
  message: t.String({ examples: ['Password changed successfully'] }),
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
  .patch(
    '/api/users/me',
    async ({ headers, body, set }) => {
      try {
        const result = await updateAuthenticatedUserProfile(headers, body);
        set.status = result.status;
        return result.body as any;
      } catch (error) {
        set.status = 400;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to update profile',
        };
      }
    },
    {
      body: updateProfileBodySchema,
      response: {
        200: updateProfileSuccessSchema,
        400: authErrorSchema,
        401: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Update current user profile',
        description: 'Update authenticated user profile fields such as name.',
      },
    },
  )
  .post(
    '/api/users/me/profile-photo',
    async ({ headers, request, set }) => {
      const result = await getAuthenticatedUser(headers);

      if (result.status !== 200) {
        set.status = result.status;
        return result.body as any;
      }

      try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
          set.status = 400;
          return {
            success: false as const,
            message: 'Profile photo file is required',
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
            message: 'Profile photo size must be less than 2MB',
          };
        }

        const uploaded = await uploadProfilePhoto(file);
        const updateResult = await updateAuthenticatedUserProfilePhoto(headers, uploaded.imageUrl);

        set.status = updateResult.status;

        if (updateResult.status !== 200) {
          return updateResult.body as any;
        }

        return {
          success: true as const,
          data: {
            imageUrl: uploaded.imageUrl,
            user: (updateResult.body as { data: { user: unknown } }).data.user,
          },
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false as const,
          message: error instanceof Error ? error.message : 'Failed to upload profile photo',
        };
      }
    },
    {
      response: {
        200: uploadProfilePhotoSuccessSchema,
        400: authErrorSchema,
        401: authErrorSchema,
        500: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Upload current user profile photo',
        description: 'Upload profile photo to MinIO and update authenticated user profilePhotoUrl.',
      },
    },
  )
  .patch(
    '/api/users/me/change-password',
    async ({ headers, body, set }) => {
      const result = await changeAuthenticatedUserPassword(headers, body);
      set.status = result.status;
      return result.body as any;
    },
    {
      body: changePasswordBodySchema,
      response: {
        200: changePasswordSuccessSchema,
        400: authErrorSchema,
        401: authErrorSchema,
      },
      detail: {
        tags: ['Auth'],
        summary: 'Change current user password',
        description: 'Change password for the currently authenticated user using current password confirmation.',
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