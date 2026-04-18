import { PrismaClient, UserRole } from '@prisma/client';

import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await hashPassword('Admin123!');
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

  console.log('Prisma seed completed.');
  console.log('Seed users: admin@elchub.local, user@elchub.local');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });