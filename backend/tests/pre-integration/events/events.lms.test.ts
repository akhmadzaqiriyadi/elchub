import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { app } from '../../../src/app';

const prisma = new PrismaClient();

type AuthSuccessResponse = {
  success: boolean;
  data: {
    accessToken: string;
  };
};

describe('pre-integration events lms api', () => {
  let adminToken: string;
  let userToken: string;
  let eventId: string;
  let sectionId: string;
  let materialId: string;

  beforeAll(async () => {
    const adminLoginRes = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'admin@elchub.local', password: 'Admin123!' }),
      })
    );
    const adminLoginData = (await adminLoginRes.json()) as AuthSuccessResponse;
    adminToken = adminLoginData.data.accessToken;

    const userLoginRes = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'user@elchub.local', password: 'User123!' }),
      })
    );
    const userLoginData = (await userLoginRes.json()) as AuthSuccessResponse;
    userToken = userLoginData.data.accessToken;

    const event = await prisma.event.findUnique({ where: { slug: 'nextjs-job-ready-cohort' } });
    if (!event) throw new Error('Event not found from seed');
    eventId = event.id;
  });

  afterAll(async () => {
    await prisma.eventSection.deleteMany({ where: { title: 'Testing Section' } });
    await prisma.$disconnect();
  });

  it('POST /api/management/events/:id/sections should create a syllabus section', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/management/events/${eventId}/sections`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Testing Section',
          order: 99,
          isActive: true,
        }),
      })
    );

    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    sectionId = body.data.id;
  });

  it('POST /api/management/events/:id/sections/:sectionId/materials should create material', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/management/events/${eventId}/sections/${sectionId}/materials`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Testing Video',
          type: 'VIDEO',
          videoUrl: 'https://youtube.com/abc',
          isPreview: false,
          durationMin: 10,
        }),
      })
    );

    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    materialId = body.data.id;
  });

  it('GET /api/events/:id/syllabus should return masked data for unauthorized users', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/events/${eventId}/syllabus`, {
        method: 'GET',
      })
    );

    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    const sections = body.data as any[];
    const testingSection = sections.find((s) => s.id === sectionId);
    expect(testingSection).toBeDefined();

    const testingMaterial = testingSection.materials.find((m: any) => m.id === materialId);
    expect(testingMaterial).toBeDefined();
    // Because isPreview is false and we hit it without token, videoUrl should be null
    expect(testingMaterial.videoUrl).toBeNull();
  });

  it('POST /api/events/materials/:materialId/complete should mark as completed for registered user', async () => {
    // The user 'user@elchub.local' is already seeded as REGISTERED for this event
    const res = await app.handle(
      new Request(`http://localhost/api/events/materials/${materialId}/complete`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      })
    );

    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.isCompleted).toBe(true);
  });

  it('POST /api/management/uploads/event-material should upload a document', async () => {
    const formData = new FormData();
    const blob = new Blob(['dummy pdf content'], { type: 'application/pdf' });
    formData.append('file', blob, 'test-document.pdf');

    const res = await app.handle(
      new Request('http://localhost/api/management/uploads/event-material', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      })
    );

    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.fileUrl).toBeDefined();
    expect(body.data.fileUrl).toContain('.pdf');
  });
});
