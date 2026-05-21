import { prisma } from '../../lib/prisma';
import { buildPaginationMeta } from '../../lib/list-query';
import type { AuthActor } from '../events/events.service';

export type AssignmentPayload = {
  sectionId?: string | null;
  title: string;
  description?: string | null;
  instructions?: string | null;
  releaseAt?: string | null;
  dueAt?: string | null;
  allowLate?: boolean;
  maxScore?: number | null;
  isPublished?: boolean;
  order?: number;
};

export type AssignmentSubmissionPayload = {
  answerText?: string | null;
  answerUrl?: string | null;
};

export type AssignmentGradePayload = {
  score?: number | null;
  feedback?: string | null;
  status?: 'GRADED' | 'RETURNED';
};

function parseOptionalDateTime(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid datetime value');
  }
  return parsed;
}

function normalizeTitle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Title is required');
  }
  return trimmed;
}

function normalizeText(value?: string | null) {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUrl(value?: string | null) {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function toSubmissionView(submission: {
  status: string;
  answerText: string | null;
  answerUrl: string | null;
  submittedAt: Date;
  score: number | null;
  feedback: string | null;
  gradedAt: Date | null;
}) {
  return {
    status: submission.status,
    answerText: submission.answerText,
    answerUrl: submission.answerUrl,
    submittedAt: submission.submittedAt.toISOString(),
    score: submission.score,
    feedback: submission.feedback,
    gradedAt: submission.gradedAt ? submission.gradedAt.toISOString() : null,
  };
}

async function verifyEventOwnership(actor: AuthActor, eventId: string) {
  if (actor.role === 'ADMIN') return true;

  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: actor.userId },
    select: { id: true },
  });

  if (!event) {
    throw new Error('Event not found or inaccessible');
  }

  return true;
}

async function listManagedAssignments(actor: AuthActor, eventId: string, page: number, limit: number) {
  await verifyEventOwnership(actor, eventId);

  const total = await prisma.eventAssignment.count({ where: { eventId } });

  const assignments = await prisma.eventAssignment.findMany({
    where: { eventId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    skip: (page - 1) * limit,
    take: limit,
    include: {
      section: {
        select: { id: true, title: true, order: true },
      },
    },
  });

  return {
    items: assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      releaseAt: assignment.releaseAt ? assignment.releaseAt.toISOString() : null,
      dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
      allowLate: assignment.allowLate,
      maxScore: assignment.maxScore,
      isPublished: assignment.isPublished,
      order: assignment.order,
      section: assignment.section,
      userSubmission: null,
    })),
    pagination: buildPaginationMeta({ page, limit, total }),
  };
}

export async function listAssignmentsForManagement(actor: AuthActor, eventId: string, page = 1, limit = 10) {
  return listManagedAssignments(actor, eventId, page, limit);
}

async function resolveAssignmentAccess(eventId: string, userId?: string) {
  let isOwner = false;
  let isAuthorized = false;

  if (!userId) {
    return { isOwner, isAuthorized };
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: userId },
    select: { id: true },
  });

  if (event) {
    return { isOwner: true, isAuthorized: true };
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { status: { select: { code: true } }, paymentStatus: true },
  });

  if (registration && registration.status.code === 'REGISTERED' && (registration.paymentStatus === 'PAID' || registration.paymentStatus === 'FREE')) {
    isAuthorized = true;
  }

  return { isOwner, isAuthorized };
}

function ensureAssignmentWindow(payload: { releaseAt?: Date | null; dueAt?: Date | null }) {
  if (payload.releaseAt && payload.dueAt && payload.dueAt <= payload.releaseAt) {
    throw new Error('Due time must be after release time');
  }
}

function normalizeScore(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
}

function normalizeOrder(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

export async function listEventAssignments(eventId: string, userId?: string, page = 1, limit = 10) {
  const access = await resolveAssignmentAccess(eventId, userId);

  if (!access.isAuthorized) {
    throw new Error('Not authorized to view assignments');
  }

  const where = {
    eventId,
    ...(access.isOwner ? {} : { isPublished: true }),
  };

  const total = await prisma.eventAssignment.count({ where });

  const assignments = await prisma.eventAssignment.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    skip: (page - 1) * limit,
    take: limit,
    include: {
      section: {
        select: { id: true, title: true, order: true },
      },
    },
  });

  const assignmentIds = assignments.map((assignment) => assignment.id);
  const submissions = userId
    ? await prisma.assignmentSubmission.findMany({
        where: { userId, assignmentId: { in: assignmentIds } },
      })
    : [];

  const submissionMap = new Map(submissions.map((submission) => [submission.assignmentId, toSubmissionView(submission)]));

  return {
    items: assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      releaseAt: assignment.releaseAt ? assignment.releaseAt.toISOString() : null,
      dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
      allowLate: assignment.allowLate,
      maxScore: assignment.maxScore,
      isPublished: assignment.isPublished,
      order: assignment.order,
      section: assignment.section,
      userSubmission: submissionMap.get(assignment.id) || null,
    })),
    pagination: buildPaginationMeta({ page, limit, total }),
  };
}

export async function getEventAssignment(eventId: string, assignmentId: string, userId?: string) {
  const access = await resolveAssignmentAccess(eventId, userId);

  if (!access.isAuthorized) {
    throw new Error('Not authorized to view assignments');
  }

  const assignment = await prisma.eventAssignment.findFirst({
    where: {
      id: assignmentId,
      eventId,
      ...(access.isOwner ? {} : { isPublished: true }),
    },
    include: {
      section: {
        select: { id: true, title: true, order: true },
      },
    },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const submission = userId
    ? await prisma.assignmentSubmission.findUnique({
        where: { assignmentId_userId: { assignmentId, userId } },
      })
    : null;

  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    instructions: assignment.instructions,
    releaseAt: assignment.releaseAt ? assignment.releaseAt.toISOString() : null,
    dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
    allowLate: assignment.allowLate,
    maxScore: assignment.maxScore,
    isPublished: assignment.isPublished,
    order: assignment.order,
    section: assignment.section,
    userSubmission: submission ? toSubmissionView(submission) : null,
  };
}

export async function createEventAssignment(actor: AuthActor, eventId: string, payload: AssignmentPayload) {
  await verifyEventOwnership(actor, eventId);

  const releaseAt = parseOptionalDateTime(payload.releaseAt);
  const dueAt = parseOptionalDateTime(payload.dueAt);
  ensureAssignmentWindow({ releaseAt, dueAt });

  if (payload.sectionId) {
    const section = await prisma.eventSection.findFirst({
      where: { id: payload.sectionId, eventId },
      select: { id: true },
    });

    if (!section) {
      throw new Error('Section not found');
    }
  }

  return prisma.eventAssignment.create({
    data: {
      eventId,
      sectionId: payload.sectionId || null,
      title: normalizeTitle(payload.title),
      description: normalizeText(payload.description),
      instructions: normalizeText(payload.instructions),
      releaseAt,
      dueAt,
      allowLate: payload.allowLate ?? false,
      maxScore: normalizeScore(payload.maxScore),
      isPublished: payload.isPublished ?? true,
      order: normalizeOrder(payload.order),
    },
    include: {
      section: {
        select: { id: true, title: true, order: true },
      },
    },
  });
}

export async function updateEventAssignment(actor: AuthActor, eventId: string, assignmentId: string, payload: AssignmentPayload) {
  await verifyEventOwnership(actor, eventId);

  const existing = await prisma.eventAssignment.findFirst({
    where: { id: assignmentId, eventId },
    select: {
      id: true,
      sectionId: true,
      title: true,
      description: true,
      instructions: true,
      releaseAt: true,
      dueAt: true,
      allowLate: true,
      maxScore: true,
      isPublished: true,
      order: true,
    },
  });

  if (!existing) {
    throw new Error('Assignment not found');
  }

  const releaseAt = parseOptionalDateTime(payload.releaseAt);
  const dueAt = parseOptionalDateTime(payload.dueAt);
  ensureAssignmentWindow({
    releaseAt: Object.prototype.hasOwnProperty.call(payload, 'releaseAt') ? releaseAt : existing.releaseAt,
    dueAt: Object.prototype.hasOwnProperty.call(payload, 'dueAt') ? dueAt : existing.dueAt,
  });

  if (Object.prototype.hasOwnProperty.call(payload, 'sectionId') && payload.sectionId) {
    const section = await prisma.eventSection.findFirst({
      where: { id: payload.sectionId, eventId },
      select: { id: true },
    });

    if (!section) {
      throw new Error('Section not found');
    }
  }

  return prisma.eventAssignment.update({
    where: { id: assignmentId },
    data: {
      sectionId: Object.prototype.hasOwnProperty.call(payload, 'sectionId') ? payload.sectionId : existing.sectionId,
      title: Object.prototype.hasOwnProperty.call(payload, 'title') ? normalizeTitle(payload.title) : existing.title,
      description: Object.prototype.hasOwnProperty.call(payload, 'description') ? normalizeText(payload.description) : existing.description,
      instructions: Object.prototype.hasOwnProperty.call(payload, 'instructions') ? normalizeText(payload.instructions) : existing.instructions,
      releaseAt: Object.prototype.hasOwnProperty.call(payload, 'releaseAt') ? releaseAt : existing.releaseAt,
      dueAt: Object.prototype.hasOwnProperty.call(payload, 'dueAt') ? dueAt : existing.dueAt,
      allowLate: Object.prototype.hasOwnProperty.call(payload, 'allowLate') ? (payload.allowLate ?? false) : existing.allowLate,
      maxScore: Object.prototype.hasOwnProperty.call(payload, 'maxScore') ? normalizeScore(payload.maxScore) : existing.maxScore,
      isPublished: Object.prototype.hasOwnProperty.call(payload, 'isPublished') ? (payload.isPublished ?? true) : existing.isPublished,
      order: Object.prototype.hasOwnProperty.call(payload, 'order') ? normalizeOrder(payload.order) : existing.order,
    },
    include: {
      section: {
        select: { id: true, title: true, order: true },
      },
    },
  });
}

export async function deleteEventAssignment(actor: AuthActor, eventId: string, assignmentId: string) {
  await verifyEventOwnership(actor, eventId);

  const deleted = await prisma.eventAssignment.deleteMany({
    where: { id: assignmentId, eventId },
  });

  if (deleted.count === 0) {
    throw new Error('Assignment not found');
  }
}

export async function submitAssignment(actor: AuthActor, assignmentId: string, payload: AssignmentSubmissionPayload) {
  const assignment = await prisma.eventAssignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, eventId: true, releaseAt: true, dueAt: true, allowLate: true },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const eventAccess = await resolveAssignmentAccess(assignment.eventId, actor.userId);

  if (!eventAccess.isAuthorized) {
    throw new Error('Not authorized to submit this assignment');
  }

  if (assignment.releaseAt && assignment.releaseAt > new Date()) {
    throw new Error('Assignment is not available yet');
  }

  if (assignment.dueAt && assignment.dueAt < new Date() && !assignment.allowLate) {
    throw new Error('Assignment deadline has passed');
  }

  const answerText = normalizeText(payload.answerText);
  const answerUrl = normalizeUrl(payload.answerUrl);

  if (!answerText && !answerUrl) {
    throw new Error('Please provide an answer text or answer URL');
  }

  const submission = await prisma.assignmentSubmission.upsert({
    where: {
      assignmentId_userId: { assignmentId, userId: actor.userId },
    },
    update: {
      answerText,
      answerUrl,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId: actor.userId,
      answerText,
      answerUrl,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  return toSubmissionView(submission);
}

export async function listAssignmentSubmissions(
  actor: AuthActor,
  eventId: string,
  assignmentId: string,
) {
  await verifyEventOwnership(actor, eventId);

  const assignment = await prisma.eventAssignment.findFirst({
    where: { id: assignmentId, eventId },
    select: { id: true },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId },
    orderBy: { submittedAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhotoUrl: true,
        },
      },
    },
  });

  return submissions.map((sub) => ({
    id: sub.id,
    assignmentId: sub.assignmentId,
    userId: sub.userId,
    answerText: sub.answerText,
    answerUrl: sub.answerUrl,
    status: sub.status,
    submittedAt: sub.submittedAt.toISOString(),
    score: sub.score,
    feedback: sub.feedback,
    gradedBy: sub.gradedBy,
    gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
    user: sub.user,
  }));
}

export async function gradeAssignmentSubmission(
  actor: AuthActor,
  eventId: string,
  assignmentId: string,
  userId: string,
  payload: AssignmentGradePayload,
) {
  await verifyEventOwnership(actor, eventId);

  const assignment = await prisma.eventAssignment.findFirst({
    where: { id: assignmentId, eventId },
    select: { id: true, maxScore: true },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_userId: { assignmentId, userId } },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  const normalizedScore =
    typeof payload.score === 'number' && !Number.isNaN(payload.score)
      ? Math.max(0, Math.floor(payload.score))
      : null;

  if (assignment.maxScore !== null && normalizedScore !== null && normalizedScore > assignment.maxScore) {
    throw new Error('Score cannot exceed assignment max score');
  }

  const graded = await prisma.assignmentSubmission.update({
    where: { assignmentId_userId: { assignmentId, userId } },
    data: {
      score: normalizedScore,
      feedback: normalizeText(payload.feedback),
      status: payload.status ?? 'GRADED',
      gradedBy: actor.userId,
      gradedAt: new Date(),
    },
  });

  return toSubmissionView(graded);
}