import 'dotenv/config';
import { BeforeAll, AfterAll } from '@cucumber/cucumber';
import prisma from '../../../src/prisma/client';

// Seed plans once before all scenarios
BeforeAll(async function () {
  // Ensure Free and Pro plans exist
  await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Free',
      displayName: 'Free Plan',
      priceMonthly: 0,
      projectsQuota: 3
    }
  });

  await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Pro',
      displayName: 'Pro Plan',
      priceMonthly: 999,
      projectsQuota: 10
    }
  });
});

// Clean up everything after all tests
AfterAll(async function () {
  await prisma.invoice.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.$disconnect();
});
