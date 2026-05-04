import { describe, expect, test, beforeAll } from 'bun:test';

import { app } from '../../../src/app';

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

describe('pre-integration users management api', () => {
  let adminToken: string;
  let userToken: string;
  let profileUserEmail: string;

  beforeAll(async () => {
    // Login as admin to get the token for management endpoints
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

    if (loginResponse.status !== 200) {
      throw new Error('Failed to login as admin for tests');
    }

    const payload = (await loginResponse.json()) as AuthSuccessResponse;
    adminToken = payload.data.accessToken;

    const uniqueEmail = `profile_user_${Date.now()}@elchub.local`;
    profileUserEmail = uniqueEmail;
    const registerResponse = await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Profile Owner',
          email: uniqueEmail,
          password: 'Profile123!',
        }),
      }),
    );

    if (registerResponse.status !== 201) {
      throw new Error('Failed to register normal user for profile tests');
    }

    const registerPayload = (await registerResponse.json()) as AuthSuccessResponse;
    userToken = registerPayload.data.accessToken;
  });

  test('PATCH /api/users/me should update current user profile', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/me', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Profile Name',
        }),
      }),
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as any;
    expect(payload.success).toBe(true);
    expect(payload.data.user.name).toBe('Updated Profile Name');
  });

  test('POST /api/users/me/profile-photo should return 400 for non-image file', async () => {
    const formData = new FormData();
    formData.append('file', new File(['not-image'], 'notes.txt', { type: 'text/plain' }));

    const response = await app.handle(
      new Request('http://localhost/api/users/me/profile-photo', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
        body: formData,
      }),
    );

    expect(response.status).toBe(400);

    const payload = (await response.json()) as any;
    expect(payload.success).toBe(false);
    expect(payload.message).toContain('Only image files are allowed');
  });

  test('PATCH /api/users/me/change-password should change current user password', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/me/change-password', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'Profile123!',
          newPassword: 'Profile123!@2',
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as any;
    expect(payload.success).toBe(true);

    const oldLoginResponse = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: profileUserEmail,
          password: 'Profile123!',
        }),
      }),
    );

    expect(oldLoginResponse.status).toBe(401);
  });

  test('PATCH /api/users/me/change-password should allow login using new password', async () => {
    const loginResponse = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: profileUserEmail,
          password: 'Profile123!@2',
        }),
      }),
    );

    expect(loginResponse.status).toBe(200);
  });

  test('GET /api/management/users should list users', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/management/users', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.items)).toBe(true);
    expect(data.data.pagination.page).toBe(1);
  });

  test('POST /api/management/users should create a new user', async () => {
    const email = `test_user_${Date.now()}@elchub.local`;
    const response = await app.handle(
      new Request('http://localhost/api/management/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Test Management User',
          email,
          password: 'SecurePassword123!',
          role: 'MENTOR',
        }),
      }),
    );

    expect(response.status).toBe(201);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(data.data.email).toBe(email);
    expect(data.data.role).toBe('MENTOR');
  });

  test('POST /api/management/users should fail on duplicate email', async () => {
    const email = `dup_user_${Date.now()}@elchub.local`;
    
    // First create
    await app.handle(
      new Request('http://localhost/api/management/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'First User',
          email,
          password: 'Password123!',
        }),
      }),
    );

    // Second create with same email
    const response = await app.handle(
      new Request('http://localhost/api/management/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Second User',
          email,
          password: 'Password123!',
        }),
      }),
    );

    expect(response.status).toBe(409);
    const data = await response.json() as any;
    expect(data.success).toBe(false);
    expect(data.message).toContain('already registered');
  });

  test('PATCH /api/management/users/:id should update user', async () => {
    // 1. Create a user
    const email = `update_user_${Date.now()}@elchub.local`;
    const createRes = await app.handle(
      new Request('http://localhost/api/management/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'To Be Updated',
          email,
          password: 'Password123!',
        }),
      }),
    );
    const created = await createRes.json() as any;
    const userId = created.data.id;

    // 2. Update the user
    const response = await app.handle(
      new Request(`http://localhost/api/management/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Name',
          isActive: false,
        }),
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Updated Name');
    expect(data.data.isActive).toBe(false);
  });

  test('DELETE /api/management/users/:id should delete user', async () => {
    // 1. Create a user
    const email = `delete_user_${Date.now()}@elchub.local`;
    const createRes = await app.handle(
      new Request('http://localhost/api/management/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'To Be Deleted',
          email,
          password: 'Password123!',
        }),
      }),
    );
    const created = await createRes.json() as any;
    const userId = created.data.id;

    // 2. Delete the user
    const response = await app.handle(
      new Request(`http://localhost/api/management/users/${userId}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }),
    );

    expect(response.status).toBe(200);
    
    // 3. Verify user is deleted
    const getResponse = await app.handle(
      new Request(`http://localhost/api/management/users/${userId}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }),
    );
    
    expect(getResponse.status).toBe(404);
  });
});
