import prisma from '../prisma/client';

export async function getAllPlans() {
  return await prisma.plan.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      priceMonthly: true,
      projectsQuota: true,
    },
    orderBy: { priceMonthly: 'asc' },
  });
}

export async function getPlanById(planId: number) {
  return await prisma.plan.findUnique({
    where: { id: planId },
  });
}

export async function getPlanByName(name: string) {
  return await prisma.plan.findUnique({
    where: { name },
  });
}
