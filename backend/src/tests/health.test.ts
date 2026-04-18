import { expect, test } from 'bun:test';

import { app } from '../app';

test('GET /health returns service status', async () => {
  const response = await app.handle(new Request('http://localhost/api/health'));

  expect(response.status).toBe(200);

  const payload = (await response.json()) as {
    status: string;
    service: string;
  };

  expect(payload.status).toBe('ok');
  expect(payload.service).toBe('elchub-backend');
});