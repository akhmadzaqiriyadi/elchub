import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeed() {
  console.log('\n=== VERIFYING SEED DATA ===\n');

  // Count users
  const users = await prisma.user.findMany();
  console.log(`✓ Users: ${users.length}`);
  users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));

  // Count event types
  const eventTypes = await prisma.eventType.findMany();
  console.log(`\n✓ Event Types: ${eventTypes.length}`);
  eventTypes.forEach((t) => console.log(`  - ${t.name}`));

  // Count event topics
  const eventTopics = await prisma.eventTopic.findMany();
  console.log(`\n✓ Event Topics: ${eventTopics.length}`);
  eventTopics.forEach((t) => console.log(`  - ${t.name}`));

  // Count event modes
  const eventModes = await prisma.eventMode.findMany();
  console.log(`\n✓ Event Modes: ${eventModes.length}`);
  eventModes.forEach((m) => console.log(`  - ${m.name}`));

  // Count event levels
  const eventLevels = await prisma.eventLevel.findMany();
  console.log(`\n✓ Event Levels: ${eventLevels.length}`);
  eventLevels.forEach((l) => console.log(`  - ${l.name}`));

  // Count event statuses
  const eventStatuses = await prisma.eventStatus.findMany();
  console.log(`\n✓ Event Statuses: ${eventStatuses.length}`);
  eventStatuses.forEach((s) => console.log(`  - ${s.code} (${s.name})`));

  // Count registration statuses
  const registrationStatuses = await prisma.registrationStatus.findMany();
  console.log(`\n✓ Registration Statuses: ${registrationStatuses.length}`);
  registrationStatuses.forEach((s) => console.log(`  - ${s.code} (${s.name})`));

  // Count events
  const events = await prisma.event.findMany();
  console.log(`\n✓ Events: ${events.length}`);
  events.forEach((e) => console.log(`  - ${e.title}`));

  // Count event registrations
  const registrations = await prisma.eventRegistration.findMany();
  console.log(`\n✓ Event Registrations: ${registrations.length}`);

  // Count event topic maps
  const topicMaps = await prisma.eventTopicMap.findMany();
  console.log(`\n✓ Event Topic Maps: ${topicMaps.length}`);

  console.log('\n=== VERIFICATION COMPLETE ===\n');
}

verifySeed()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
