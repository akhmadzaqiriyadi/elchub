import { describe, expect, test } from 'bun:test';
import { SignJWT } from 'jose';

import { app } from '../../../src/app';
import { env } from '../../../src/config/env';

type AuthSuccessResponse = {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    accessToken: string;
  };
};

describe('pre-integration auth api', () => {
  test('me endpoint should return 401 for expired token', async () => {
    const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    const expiredToken = await new SignJWT({
      email: 'expired@elchub.local',
      role: 'USER',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('expired-user-id')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(accessSecret);

    const meResponse = await app.handle(
      new Request('http://localhost/api/auth/me', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      }),
    );

    expect(meResponse.status).toBe(401);

    const mePayload = (await meResponse.json()) as {
      success: boolean;
      message: string;
    };

    expect(mePayload.success).toBe(false);
    expect(mePayload.message).toContain('expired');
  });

  test('register endpoint should create a new user and return token', async () => {
    const email = `register_${Date.now()}@elchub.local`;

    const registerResponse = await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Register Test',
          email,
          password: 'Register123!',
        }),
      }),
    );

    expect(registerResponse.status).toBe(201);

    const registerPayload = (await registerResponse.json()) as AuthSuccessResponse;

    expect(registerPayload.success).toBe(true);
    expect(registerPayload.data.user.email).toBe(email);
    expect(registerPayload.data.accessToken.length).toBeGreaterThan(20);
  });

  test('register endpoint should reject duplicate email', async () => {
    const duplicateEmail = `duplicate_${Date.now()}@elchub.local`;

    const firstRegister = await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Duplicate Test',
          email: duplicateEmail,
          password: 'Duplicate123!',
        }),
      }),
    );

    expect(firstRegister.status).toBe(201);

    const secondRegister = await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Duplicate Test',
          email: duplicateEmail,
          password: 'Duplicate123!',
        }),
      }),
    );

    expect(secondRegister.status).toBe(409);

    const duplicatePayload = (await secondRegister.json()) as {
      success: boolean;
      message: string;
    };

    expect(duplicatePayload.success).toBe(false);
    expect(duplicatePayload.message).toContain('already registered');
  });

  test('login and me endpoint should return the authenticated user', async () => {
    const loginResponse = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@elchub.local',
          password: 'Admin123!',
        }),
      }),
    );

    expect(loginResponse.status).toBe(200);

    const loginPayload = (await loginResponse.json()) as AuthSuccessResponse;
    const token = loginPayload.data.accessToken;

    const meResponse = await app.handle(
      new Request('http://localhost/api/auth/me', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(meResponse.status).toBe(200);

    const mePayload = (await meResponse.json()) as {
      success: boolean;
      data: {
        user: {
          email: string;
        };
      };
    };

    expect(mePayload.success).toBe(true);
    expect(mePayload.data.user.email).toBe('admin@elchub.local');
  });

  test('logout endpoint should revoke session and reject me for the same token', async () => {
    const loginResponse = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@elchub.local',
          password: 'Admin123!',
        }),
      }),
    );

    expect(loginResponse.status).toBe(200);

    const loginPayload = (await loginResponse.json()) as AuthSuccessResponse;
    const token = loginPayload.data.accessToken;

    const logoutResponse = await app.handle(
      new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(logoutResponse.status).toBe(200);

    const logoutPayload = (await logoutResponse.json()) as {
      success: boolean;
      message: string;
    };

    expect(logoutPayload.success).toBe(true);
    expect(logoutPayload.message).toContain('Logged out');

    const meAfterLogoutResponse = await app.handle(
      new Request('http://localhost/api/auth/me', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(meAfterLogoutResponse.status).toBe(401);
  });

  test('forgot-password endpoint should accept valid email and return 200', async () => {
    const email = `forgot_${Date.now()}@elchub.local`;

    await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Forgot Test',
          email,
          password: 'Forgot123!',
        }),
      }),
    );

    const forgotResponse = await app.handle(
      new Request('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }),
    );

    expect(forgotResponse.status).toBe(200);

    const forgotPayload = (await forgotResponse.json()) as {
      success: boolean;
      message: string;
    };

    expect(forgotPayload.success).toBe(true);
    expect(forgotPayload.message).toContain('If that email is registered');
  });

  test('forgot-password endpoint should also return 200 for non-existing email', async () => {
    const forgotResponse = await app.handle(
      new Request('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: `nonexistent_${Date.now()}@elchub.local`,
        }),
      }),
    );

    expect(forgotResponse.status).toBe(200);

    const forgotPayload = (await forgotResponse.json()) as {
      success: boolean;
      message: string;
    };

    expect(forgotPayload.success).toBe(true);
    expect(forgotPayload.message).toContain('If that email is registered');
  });

  test('reset-password endpoint should reject invalid token', async () => {
    const resetResponse = await app.handle(
      new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          token: 'invalid_token_12345',
          password: 'NewPassword123!',
        }),
      }),
    );

    expect(resetResponse.status).toBe(400);

    const resetPayload = (await resetResponse.json()) as {
      success: boolean;
      message: string;
    };

    expect(resetPayload.success).toBe(false);
    expect(resetPayload.message).toContain('invalid or expired');
  });
});