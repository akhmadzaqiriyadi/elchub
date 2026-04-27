import { PrismaClient, UserRole } from '@prisma/client';

import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function seedEventMasterData() {
  const eventTypes = [
    { name: 'Webinar', slug: 'webinar', sortOrder: 10 },
    { name: 'Workshop', slug: 'workshop', sortOrder: 20 },
    { name: 'Mentoring Session', slug: 'mentoring-session', sortOrder: 30 },
    { name: 'Bootcamp', slug: 'bootcamp', sortOrder: 40 },
    { name: 'Networking', slug: 'networking', sortOrder: 50 },
    { name: 'Competition / Hackathon', slug: 'competition-hackathon', sortOrder: 60 },
  ];

  const eventTopics = [
    { name: 'Frontend', slug: 'frontend', sortOrder: 10 },
    { name: 'Backend', slug: 'backend', sortOrder: 20 },
    { name: 'UI/UX', slug: 'ui-ux', sortOrder: 30 },
    { name: 'Data / AI', slug: 'data-ai', sortOrder: 40 },
    { name: 'Career', slug: 'career', sortOrder: 50 },
    { name: 'Business', slug: 'business', sortOrder: 60 },
  ];

  const eventModes = [
    { name: 'Online', slug: 'online', sortOrder: 10 },
    { name: 'Offline', slug: 'offline', sortOrder: 20 },
    { name: 'Hybrid', slug: 'hybrid', sortOrder: 30 },
  ];

  const eventLevels = [
    { name: 'Beginner', slug: 'beginner', sortOrder: 10 },
    { name: 'Intermediate', slug: 'intermediate', sortOrder: 20 },
    { name: 'Advanced', slug: 'advanced', sortOrder: 30 },
    { name: 'All Levels', slug: 'all-levels', sortOrder: 40 },
  ];

  const eventStatuses = [
    { code: 'DRAFT', name: 'Draft', sortOrder: 10 },
    { code: 'PUBLISHED', name: 'Published', sortOrder: 20 },
    { code: 'CLOSED', name: 'Closed', sortOrder: 30 },
    { code: 'CANCELLED', name: 'Cancelled', sortOrder: 40 },
    { code: 'COMPLETED', name: 'Completed', sortOrder: 50 },
  ];

  const registrationStatuses = [
    { code: 'REGISTERED', name: 'Registered', sortOrder: 10 },
    { code: 'WAITLISTED', name: 'Waitlisted', sortOrder: 20 },
    { code: 'CANCELLED', name: 'Cancelled', sortOrder: 30 },
    { code: 'ATTENDED', name: 'Attended', sortOrder: 40 },
    { code: 'NO_SHOW', name: 'No Show', sortOrder: 50 },
  ];

  for (const item of eventTypes) {
    await prisma.eventType.upsert({
      where: { slug: item.slug },
      update: { name: item.name, sortOrder: item.sortOrder, isActive: true },
      create: { ...item, isActive: true },
    });
  }

  for (const item of eventTopics) {
    await prisma.eventTopic.upsert({
      where: { slug: item.slug },
      update: { name: item.name, sortOrder: item.sortOrder, isActive: true },
      create: { ...item, isActive: true },
    });
  }

  for (const item of eventModes) {
    await prisma.eventMode.upsert({
      where: { slug: item.slug },
      update: { name: item.name, sortOrder: item.sortOrder, isActive: true },
      create: { ...item, isActive: true },
    });
  }

  for (const item of eventLevels) {
    await prisma.eventLevel.upsert({
      where: { slug: item.slug },
      update: { name: item.name, sortOrder: item.sortOrder, isActive: true },
      create: { ...item, isActive: true },
    });
  }

  for (const item of eventStatuses) {
    await prisma.eventStatus.upsert({
      where: { code: item.code },
      update: { name: item.name, sortOrder: item.sortOrder, isActive: true },
      create: { ...item, isActive: true },
    });
  }

  for (const item of registrationStatuses) {
    await prisma.registrationStatus.upsert({
      where: { code: item.code },
      update: { name: item.name, sortOrder: item.sortOrder, isActive: true },
      create: { ...item, isActive: true },
    });
  }
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function seedEvents() {
  const organizer = await prisma.user.findUnique({ where: { email: 'organizer@elchub.local' } });
  const mentor = await prisma.user.findUnique({ where: { email: 'mentor@elchub.local' } });
  const user = await prisma.user.findUnique({ where: { email: 'user@elchub.local' } });
  const attendeeA = await prisma.user.findUnique({ where: { email: 'attendee.a@elchub.local' } });
  const attendeeB = await prisma.user.findUnique({ where: { email: 'attendee.b@elchub.local' } });

  if (!organizer || !mentor || !user || !attendeeA || !attendeeB) {
    throw new Error('Required seed users are missing.');
  }

  const [
    webinarType,
    workshopType,
    mentoringType,
    onlineMode,
    offlineMode,
    hybridMode,
    beginnerLevel,
    intermediateLevel,
    allLevels,
    draftStatus,
    publishedStatus,
    closedStatus,
    completedStatus,
    cancelledStatus,
    registeredStatus,
    waitlistedStatus,
    attendedStatus,
    noShowStatus,
  ] = await Promise.all([
    prisma.eventType.findUniqueOrThrow({ where: { slug: 'webinar' } }),
    prisma.eventType.findUniqueOrThrow({ where: { slug: 'workshop' } }),
    prisma.eventType.findUniqueOrThrow({ where: { slug: 'mentoring-session' } }),
    prisma.eventMode.findUniqueOrThrow({ where: { slug: 'online' } }),
    prisma.eventMode.findUniqueOrThrow({ where: { slug: 'offline' } }),
    prisma.eventMode.findUniqueOrThrow({ where: { slug: 'hybrid' } }),
    prisma.eventLevel.findUniqueOrThrow({ where: { slug: 'beginner' } }),
    prisma.eventLevel.findUniqueOrThrow({ where: { slug: 'intermediate' } }),
    prisma.eventLevel.findUniqueOrThrow({ where: { slug: 'all-levels' } }),
    prisma.eventStatus.findUniqueOrThrow({ where: { code: 'DRAFT' } }),
    prisma.eventStatus.findUniqueOrThrow({ where: { code: 'PUBLISHED' } }),
    prisma.eventStatus.findUniqueOrThrow({ where: { code: 'CLOSED' } }),
    prisma.eventStatus.findUniqueOrThrow({ where: { code: 'COMPLETED' } }),
    prisma.eventStatus.findUniqueOrThrow({ where: { code: 'CANCELLED' } }),
    prisma.registrationStatus.findUniqueOrThrow({ where: { code: 'REGISTERED' } }),
    prisma.registrationStatus.findUniqueOrThrow({ where: { code: 'WAITLISTED' } }),
    prisma.registrationStatus.findUniqueOrThrow({ where: { code: 'ATTENDED' } }),
    prisma.registrationStatus.findUniqueOrThrow({ where: { code: 'NO_SHOW' } }),
  ]);

  const topics = await prisma.eventTopic.findMany({ where: { slug: { in: ['frontend', 'backend', 'data-ai', 'career'] } } });
  const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));

  const now = new Date();

  const events = [
    {
      slug: 'nextjs-job-ready-cohort',
      title: 'Next.js Job Ready Cohort',
      description:
        '<p>Belajar Next.js dari nol sampai deploy produksi.</p><ul><li>Architecture App Router</li><li>State & Data Fetching</li><li>Deployment Strategy</li></ul>',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      organizerId: organizer.id,
      typeId: workshopType.id,
      modeId: onlineMode.id,
      levelId: beginnerLevel.id,
      statusId: publishedStatus.id,
      registrationOpenAt: addDays(now, -3),
      registrationCloseAt: addDays(now, 6),
      startAt: addDays(now, 7),
      endAt: addDays(addHours(now, 2), 7),
      timezone: 'Asia/Jakarta',
      capacity: 120,
      topicSlugs: ['frontend', 'career'],
      registrations: [
        { userId: user.id, statusId: registeredStatus.id },
        { userId: attendeeA.id, statusId: registeredStatus.id },
      ],
    },
    {
      slug: 'backend-scalability-masterclass',
      title: 'Backend Scalability Masterclass',
      description:
        '<p>Sesi mendalam tentang <strong>API performance</strong>, caching, dan observability untuk sistem skala besar.</p>',
      meetLink: null,
      organizerId: organizer.id,
      typeId: webinarType.id,
      modeId: offlineMode.id,
      levelId: intermediateLevel.id,
      statusId: closedStatus.id,
      registrationOpenAt: addDays(now, -14),
      registrationCloseAt: addDays(now, -2),
      startAt: addDays(now, 1),
      endAt: addDays(addHours(now, 3), 1),
      timezone: 'Asia/Jakarta',
      capacity: 80,
      topicSlugs: ['backend'],
      registrations: [
        { userId: attendeeA.id, statusId: waitlistedStatus.id },
        { userId: attendeeB.id, statusId: registeredStatus.id },
      ],
    },
    {
      slug: 'data-ai-career-night',
      title: 'Data & AI Career Night',
      description:
        '<p>Panel talk dengan mentor industri untuk roadmap karier Data & AI.</p><p>Termasuk sesi networking hybrid.</p>',
      meetLink: 'https://meet.google.com/klm-nopq-rst',
      organizerId: organizer.id,
      typeId: webinarType.id,
      modeId: hybridMode.id,
      levelId: allLevels.id,
      statusId: completedStatus.id,
      registrationOpenAt: addDays(now, -30),
      registrationCloseAt: addDays(now, -21),
      startAt: addDays(now, -20),
      endAt: addDays(addHours(now, 2), -20),
      timezone: 'Asia/Jakarta',
      capacity: 200,
      topicSlugs: ['data-ai', 'career'],
      registrations: [
        { userId: user.id, statusId: attendedStatus.id },
        { userId: mentor.id, statusId: attendedStatus.id },
        { userId: attendeeB.id, statusId: noShowStatus.id },
      ],
    },
    {
      slug: 'mentoring-office-hour-product-engineering',
      title: 'Mentoring Office Hour: Product Engineering',
      description:
        '<p>1-on-1 mentoring session untuk review CV, portfolio, dan mock interview teknikal.</p>',
      meetLink: 'https://meet.google.com/uvw-xyza-bcd',
      organizerId: organizer.id,
      typeId: mentoringType.id,
      modeId: onlineMode.id,
      levelId: allLevels.id,
      statusId: draftStatus.id,
      registrationOpenAt: addDays(now, 2),
      registrationCloseAt: addDays(now, 10),
      startAt: addDays(now, 12),
      endAt: addDays(addHours(now, 1), 12),
      timezone: 'Asia/Jakarta',
      capacity: 25,
      topicSlugs: ['career'],
      registrations: [],
    },
    {
      slug: 'community-networking-summit-q2',
      title: 'Community Networking Summit Q2',
      description: '<p>Acara networking komunitas untuk berbagi peluang kolaborasi dan proyek.</p>',
      meetLink: null,
      organizerId: organizer.id,
      typeId: webinarType.id,
      modeId: offlineMode.id,
      levelId: allLevels.id,
      statusId: cancelledStatus.id,
      registrationOpenAt: addDays(now, -10),
      registrationCloseAt: addDays(now, -6),
      startAt: addDays(now, -4),
      endAt: addDays(addHours(now, 3), -4),
      timezone: 'Asia/Jakarta',
      capacity: 150,
      topicSlugs: ['career'],
      registrations: [{ userId: user.id, statusId: registeredStatus.id }],
    },
  ];

  for (const item of events) {
    const event = await prisma.event.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        meetLink: item.meetLink,
        organizerId: item.organizerId,
        typeId: item.typeId,
        modeId: item.modeId,
        levelId: item.levelId,
        statusId: item.statusId,
        registrationOpenAt: item.registrationOpenAt,
        registrationCloseAt: item.registrationCloseAt,
        startAt: item.startAt,
        endAt: item.endAt,
        timezone: item.timezone,
        capacity: item.capacity,
      },
      create: {
        slug: item.slug,
        title: item.title,
        description: item.description,
        meetLink: item.meetLink,
        organizerId: item.organizerId,
        typeId: item.typeId,
        modeId: item.modeId,
        levelId: item.levelId,
        statusId: item.statusId,
        registrationOpenAt: item.registrationOpenAt,
        registrationCloseAt: item.registrationCloseAt,
        startAt: item.startAt,
        endAt: item.endAt,
        timezone: item.timezone,
        capacity: item.capacity,
      },
    });

    await prisma.eventTopicMap.deleteMany({ where: { eventId: event.id } });

    const topicData = item.topicSlugs
      .map((slug) => topicBySlug.get(slug))
      .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
      .map((topic) => ({
        eventId: event.id,
        topicId: topic.id,
      }));

    if (topicData.length > 0) {
      await prisma.eventTopicMap.createMany({
        data: topicData,
        skipDuplicates: true,
      });
    }

    await prisma.eventRegistration.deleteMany({ where: { eventId: event.id } });

    if (item.registrations.length > 0) {
      await prisma.eventRegistration.createMany({
        data: item.registrations.map((registration) => ({
          eventId: event.id,
          userId: registration.userId,
          statusId: registration.statusId,
        })),
      });
    }
  }
}

async function main() {
  const adminPasswordHash = await hashPassword('Admin123!');
  const organizerPasswordHash = await hashPassword('Organizer123!');
  const mentorPasswordHash = await hashPassword('Mentor123!');
  const userPasswordHash = await hashPassword('User123!');

  await prisma.user.upsert({
    where: { email: 'admin@elchub.local' },
    update: {
      name: 'System Admin',
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      name: 'System Admin',
      email: 'admin@elchub.local',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'organizer@elchub.local' },
    update: {
      name: 'Event Organizer',
      role: UserRole.ORGANIZER,
      isActive: true,
    },
    create: {
      name: 'Event Organizer',
      email: 'organizer@elchub.local',
      passwordHash: organizerPasswordHash,
      role: UserRole.ORGANIZER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'mentor@elchub.local' },
    update: {
      name: 'Community Mentor',
      role: UserRole.MENTOR,
      isActive: true,
    },
    create: {
      name: 'Community Mentor',
      email: 'mentor@elchub.local',
      passwordHash: mentorPasswordHash,
      role: UserRole.MENTOR,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@elchub.local' },
    update: {
      name: 'Demo User',
      role: UserRole.USER,
      isActive: true,
    },
    create: {
      name: 'Demo User',
      email: 'user@elchub.local',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'attendee.a@elchub.local' },
    update: {
      name: 'Attendee A',
      role: UserRole.USER,
      isActive: true,
    },
    create: {
      name: 'Attendee A',
      email: 'attendee.a@elchub.local',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'attendee.b@elchub.local' },
    update: {
      name: 'Attendee B',
      role: UserRole.USER,
      isActive: true,
    },
    create: {
      name: 'Attendee B',
      email: 'attendee.b@elchub.local',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
      isActive: true,
    },
  });

  await seedEventMasterData();
  await seedEvents();

  console.log('Prisma seed completed.');
  console.log(
    'Seed users: admin@elchub.local, organizer@elchub.local, mentor@elchub.local, user@elchub.local, attendee.a@elchub.local, attendee.b@elchub.local',
  );
  console.log('Seed event master data: types, topics, modes, levels, event statuses, registration statuses.');
  console.log('Seed demo events: online/offline/hybrid with topics and registrations.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });