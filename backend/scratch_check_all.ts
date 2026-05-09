import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.eventSection.findMany({
    include: { event: { select: { title: true, id: true } } },
  });
  console.log('All Sections:', JSON.stringify(sections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
