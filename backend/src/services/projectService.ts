import prisma from '../prisma/client';
import { getCurrentSubscription } from './subscriptionService';

const FREE_PLAN_PROJECT_LIMIT = 3;

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export async function listUserProjects(userId: number) {
  return await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createProject(userId: number, data: { name: string; description?: string }) {
  // Obtener la suscripción activa del usuario
  let projectsQuota = 3; // Default Free
  try {
    const subscription = await getCurrentSubscription(userId);
    if (subscription && subscription.plan && typeof subscription.plan.projectsQuota === 'number') {
      projectsQuota = subscription.plan.projectsQuota;
    }
  } catch (e) {
    // Si no hay suscripción activa, usar default (Free)
    projectsQuota = 3;
  }

  const projectCount = await prisma.project.count({
    where: { ownerId: userId },
  });

  if (projectCount >= projectsQuota) {
    throw new QuotaExceededError(`Plan limit reached. Maximum ${projectsQuota} projects allowed.`);
  }

  return await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteProject(userId: number, projectId: number) {
  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return null;
  }

  if (project.ownerId !== userId) {
    throw new Error('Forbidden: You do not own this project');
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return true;
}
