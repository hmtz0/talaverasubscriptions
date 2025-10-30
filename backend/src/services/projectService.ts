import prisma from '../prisma/client';

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
  // Check quota (Free plan: max 3 projects)
  const projectCount = await prisma.project.count({
    where: { ownerId: userId },
  });

  if (projectCount >= FREE_PLAN_PROJECT_LIMIT) {
    throw new QuotaExceededError(
      `Free plan limit reached. Maximum ${FREE_PLAN_PROJECT_LIMIT} projects allowed.`
    );
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
