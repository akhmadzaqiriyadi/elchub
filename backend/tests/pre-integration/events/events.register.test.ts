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

describe('pre-integration events registration api', () => {
  let userToken: string;
  let masterData: any;

  let freeEventId: string;
  let paidEventId: string;

  beforeAll(async () => {
    // Login as a user/admin
    const loginResponse = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'admin@elchub.local', password: 'Admin123!' }),
      }),
    );
    const payload = (await loginResponse.json()) as AuthSuccessResponse;
    userToken = payload.data.accessToken;

    // Get master data for creating an event
    const mdResponse = await app.handle(
      new Request('http://localhost/api/management/event-master-data', {
        method: 'GET',
        headers: { authorization: `Bearer ${userToken}` },
      }),
    );
    const mdPayload = await mdResponse.json() as any;
    masterData = mdPayload.data;

    const typeId = masterData.types[0].id;
    const modeId = masterData.modes[0].id;
    // For registration, event MUST be PUBLISHED
    const publishedStatusId = masterData.eventStatuses.find((s: any) => s.code === 'PUBLISHED')?.id || masterData.eventStatuses[0].id;

    // 1. Create FREE event
    const freeRes = await app.handle(
      new Request('http://localhost/api/management/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${userToken}` },
        body: JSON.stringify({
          title: 'Free Event for Register Test ' + Date.now(),
          typeId,
          modeId,
          statusId: publishedStatusId,
          isFree: true,
          meetLink: 'https://meet.google.com/test',
        }),
      }),
    );
    const freeData = await freeRes.json() as any;
    freeEventId = freeData.data.id; // from create event success schema

    // 2. Create PAID event
    const paidRes = await app.handle(
      new Request('http://localhost/api/management/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${userToken}` },
        body: JSON.stringify({
          title: 'Paid Event for Register Test ' + Date.now(),
          typeId,
          modeId,
          statusId: publishedStatusId,
          isFree: false,
          price: 50000,
          meetLink: 'https://meet.google.com/test',
        }),
      }),
    );
    const paidData = await paidRes.json() as any;
    paidEventId = paidData.data.id;
  });

  test('POST /api/events/:id/register should successfully register to a free event', async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/events/${freeEventId}/register`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          customAnswers: { q1: 'test' }
        }),
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(data.data.paymentStatus).toBe('FREE');
    expect(data.data.paymentProofUrl).toBeNull();
  });

  test('POST /api/events/:id/register should fail to register if paid event has no payment proof', async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/events/${paidEventId}/register`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          customAnswers: { q1: 'test paid' }
          // no paymentProofUrl
        }),
      }),
    );

    expect(response.status).toBe(400);
    const data = await response.json() as any;
    expect(data.success).toBe(false);
    expect(data.message).toContain('Payment proof is required');
  });

  test('POST /api/events/:id/register should successfully register to a paid event with payment proof', async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/events/${paidEventId}/register`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          customAnswers: { q1: 'test paid success' },
          paymentProofUrl: 'https://minio.local/bukti.jpg'
        }),
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(data.data.paymentStatus).toBe('WAITING_VERIFICATION');
    expect(data.data.paymentProofUrl).toBe('https://minio.local/bukti.jpg');
  });

  test('POST /api/events/:id/register should prevent double booking', async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/events/${freeEventId}/register`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    const data = await response.json() as any;
    expect(data.success).toBe(false);
    expect(data.message).toContain('already registered');
  });
});
