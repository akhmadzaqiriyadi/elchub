import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventId = 'cmorlq2kk000xpmzt9vzw7xlw';
  const sections = await prisma.eventSection.findMany({
    where: { eventId },
    include: { materials: true },
  });
  console.log('Sections for', eventId, ':', JSON.stringify(sections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
