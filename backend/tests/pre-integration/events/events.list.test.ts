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

describe('pre-integration events list api (sorting & filtering)', () => {
  let adminToken: string;

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
  });

  test('GET /api/management/events should list events with default sorting', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/management/events', {
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

  test('GET /api/management/events should support dynamic sorting (startAt asc)', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/management/events?sortBy=startAt&sortOrder=asc', {
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
  });

  test('GET /api/management/events should support dynamic sorting (title desc)', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/management/events?sortBy=title&sortOrder=desc', {
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
  });

  test('GET /api/management/events should support date range filtering', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/management/events?startDate=2024-01-01T00:00:00Z&endDate=2030-12-31T23:59:59Z', {
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
  });
});

describe('pre-integration public events list api', () => {
  test('GET /api/events should list events', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/events', {
        method: 'GET',
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.items)).toBe(true);
  });

  test('GET /api/events should filter by isFree', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/events?isFree=true', {
        method: 'GET',
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    if (data.data.items.length > 0) {
      expect(data.data.items[0].isFree).toBe(true);
    }
  });

  test('GET /api/events should filter by price range', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/events?minPrice=10000&maxPrice=100000', {
        method: 'GET',
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    if (data.data.items.length > 0) {
      expect(data.data.items[0].price).toBeGreaterThanOrEqual(10000);
      expect(data.data.items[0].price).toBeLessThanOrEqual(100000);
    }
  });

  test('GET /api/events should filter by levelSlug', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/events?levelSlug=beginner', {
        method: 'GET',
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    if (data.data.items.length > 0 && data.data.items[0].level) {
      expect(data.data.items[0].level.slug).toBe('beginner');
    }
  });
});
