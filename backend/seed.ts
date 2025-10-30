import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '.env') });
config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create plans
  const freePlan = await prisma.plan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free Plan',
      priceMonthly: 0,
      projectsQuota: 3,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      displayName: 'Pro Plan',
      priceMonthly: 999, // $9.99
      projectsQuota: 10,
    },
  });

  console.log('✅ Plans created:', { freePlan, proPlan });
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
