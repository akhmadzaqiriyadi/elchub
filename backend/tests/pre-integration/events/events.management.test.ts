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

describe('pre-integration events management api (custom fields)', () => {
  let adminToken: string;
  let masterData: any;

  beforeAll(async () => {
    // Login
    const loginResponse = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'admin@elchub.local', password: 'Admin123!' }),
      }),
    );
    const payload = (await loginResponse.json()) as AuthSuccessResponse;
    adminToken = payload.data.accessToken;

    // Get master data for creating event
    const mdResponse = await app.handle(
      new Request('http://localhost/api/management/event-master-data', {
        method: 'GET',
        headers: { authorization: `Bearer ${adminToken}` },
      }),
    );
    const mdPayload = await mdResponse.json() as any;
    masterData = mdPayload.data;
  });

  test('POST /api/management/events should create a paid event with custom schema', async () => {
    const typeId = masterData.types[0].id;
    const modeId = masterData.modes[0].id;
    const statusId = masterData.eventStatuses.find((s: any) => s.code === 'DRAFT')?.id || masterData.eventStatuses[0].id;

    const formSchema = [
      { id: "q1", type: "text", label: "Alasan ikut event?", required: true }
    ];

    const response = await app.handle(
      new Request('http://localhost/api/management/events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Paid Event with Custom Form ' + Date.now(),
          typeId,
          modeId,
          statusId,
          isFree: false,
          price: 150000,
          formSchema,
          meetLink: 'https://meet.google.com/abc-defg-hij',
        }),
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.success).toBe(true);
    expect(data.data.isFree).toBe(false);
    expect(data.data.price).toBe(150000);
    expect(data.data.formSchema).toBeDefined();
    expect(data.data.formSchema.length).toBe(1);
    expect(data.data.formSchema[0].id).toBe('q1');
  });

  test('POST /api/management/events should fail if isFree=false but price is missing or negative', async () => {
    const typeId = masterData.types[0].id;
    const modeId = masterData.modes[0].id;
    const statusId = masterData.eventStatuses[0].id;

    const response = await app.handle(
      new Request('http://localhost/api/management/events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Invalid Paid Event ' + Date.now(),
          typeId,
          modeId,
          statusId,
          isFree: false,
          price: -50000, // Invalid negative price
          meetLink: 'https://meet.google.com/abc-defg-hij',
        }),
      }),
    );

    // Our validate logic throws an Error, which mapMasterDataError catches as 400
    expect(response.status).toBe(400);
    const data = await response.json() as any;
    expect(data.success).toBe(false);
    expect(data.message).toContain('positive number');
  });
});
