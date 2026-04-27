import { expect, test } from 'bun:test';

import { app } from '../app';

test('GET /api/events returns empty scaffold list', async () => {
  const response = await app.handle(new Request('http://localhost/api/events'));

  expect(response.status).toBe(200);

  const payload = (await response.json()) as {
    success: boolean;
    data: {
      items: unknown[];
      pagination: {
        page: number;
        limit: number;
      };
    };
  };

  expect(payload.success).toBe(true);
  expect(Array.isArray(payload.data.items)).toBe(true);
  expect(payload.data.pagination.page).toBe(1);
});

test('POST /api/events requires bearer token', async () => {
  const response = await app.handle(
    new Request('http://localhost/api/events', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ title: 'Sample Event' }),
    }),
  );

  expect(response.status).toBe(401);

  const payload = (await response.json()) as {
    success: boolean;
    message: string;
  };

  expect(payload.success).toBe(false);
  expect(payload.message).toContain('Token');
});