import { beforeAll, afterAll, describe, expect, it } from 'bun:test';
import { PrismaClient } from '@prisma/client';

import { app } from '../../../src/app';

const prisma = new PrismaClient();

type AuthSuccessResponse = {
  success: boolean;
  data: {
    accessToken: string;
  };
};

describe('pre-integration events assignments api', () => {
  let adminToken: string;
  let userToken: string;
  let eventId: string;
  let assignmentId: string;
  const assignmentTitle = `Pre-integration Assignment ${Date.now()}`;

  beforeAll(async () => {
    const adminLoginRes = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'admin@elchub.local', password: 'Admin123!' }),
      }),
    );
    const adminLoginData = (await adminLoginRes.json()) as AuthSuccessResponse;
    adminToken = adminLoginData.data.accessToken;

    const userLoginRes = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'user@elchub.local', password: 'User123!' }),
      }),
    );
    const userLoginData = (await userLoginRes.json()) as AuthSuccessResponse;
    userToken = userLoginData.data.accessToken;

    const event = await prisma.event.findUnique({ where: { slug: 'nextjs-job-ready-cohort' } });
    if (!event) throw new Error('Event not found from seed');
    eventId = event.id;
  });

  afterAll(async () => {
    if (assignmentId) {
      await prisma.assignmentSubmission.deleteMany({ where: { assignmentId } });
      await prisma.eventAssignment.deleteMany({ where: { id: assignmentId } });
    }

    await prisma.$disconnect();
  });

  it('POST /api/management/events/:id/assignments should create an assignment', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/management/events/${eventId}/assignments`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: assignmentTitle,
          description: 'Assignment for pre-integration test',
          instructions: 'Write a short answer and submit it',
          isPublished: true,
          order: 77,
          maxScore: 100,
          allowLate: false,
        }),
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe(assignmentTitle);
    assignmentId = body.data.id;
  });

  it('GET /api/events/:id/assignments should return the created assignment', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/events/${eventId}/assignments`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items.length).toBeGreaterThan(0);

    const found = body.data.items.find((item: any) => item.id === assignmentId);
    expect(found).toBeDefined();
    expect(found.title).toBe(assignmentTitle);
  });

  it('POST /api/events/assignments/:assignmentId/submit should save a user submission', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/events/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          answerText: 'This is my assignment answer for pre-integration test.',
        }),
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('SUBMITTED');
    expect(body.data.answerText).toContain('assignment answer');
  });

  it('GET /api/events/:id/assignments/:assignmentId should expose the user submission', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/events/${eventId}/assignments/${assignmentId}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(assignmentId);
    expect(body.data.userSubmission).not.toBeNull();
    expect(body.data.userSubmission.answerText).toContain('assignment answer');
  });

  it('POST /api/events/assignments/:assignmentId/submit should reject unregistered users', async () => {
    const outsiderEmail = `outsider_${Date.now()}@elchub.local`;

    const registerResponse = await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Outsider User',
          email: outsiderEmail,
          password: 'Outsider123!',
        }),
      }),
    );

    expect(registerResponse.status).toBe(201);
    const registerBody = (await registerResponse.json()) as AuthSuccessResponse;
    const outsiderToken = registerBody.data.accessToken;

    const res = await app.handle(
      new Request(`http://localhost/api/events/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${outsiderToken}`,
        },
        body: JSON.stringify({
          answerText: 'This should not be accepted because the user is not registered.',
        }),
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Not authorized');
  });

  it('PUT /api/management/events/:id/assignments/:assignmentId should update the assignment', async () => {
    const updatedTitle = `${assignmentTitle} Updated`;

    const res = await app.handle(
      new Request(`http://localhost/api/management/events/${eventId}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: updatedTitle,
          description: 'Updated assignment description',
          instructions: 'Updated instructions',
          isPublished: true,
          order: 88,
          maxScore: 90,
          allowLate: true,
        }),
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe(updatedTitle);
  });

  it('PATCH /api/management/events/:id/assignments/:assignmentId/submissions/:userId/grade should grade the submission', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'user@elchub.local' } });
    if (!user) throw new Error('Seed user not found');

    const res = await app.handle(
      new Request(`http://localhost/api/management/events/${eventId}/assignments/${assignmentId}/submissions/${user.id}/grade`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          score: 85,
          feedback: 'Nice work, but improve the structure.',
          status: 'GRADED',
        }),
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.score).toBe(85);
    expect(body.data.feedback).toContain('Nice work');
    expect(body.data.gradedAt).toBeDefined();
  });

  it('DELETE /api/management/events/:id/assignments/:assignmentId should delete the assignment', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/management/events/${eventId}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }),
    );

    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    const lookup = await prisma.eventAssignment.findUnique({ where: { id: assignmentId } });
    expect(lookup).toBeNull();
    assignmentId = '';
  });
});