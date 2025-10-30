import prisma from '../prisma/client';

export type TaskInput = {
  title: string;
  description?: string | null;
  ownerId: number;
  done?: boolean;
};

export async function create(data: TaskInput) {
  return prisma.task.create({ data });
}

export async function findByOwner(ownerId: number, query: any) {
  const take = Math.min(Number(query.take || 20), 100);
  const skip = Number(query.skip || 0);
  return prisma.task.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}

export async function findById(id: number) {
  return prisma.task.findUnique({ where: { id } });
}

export async function update(id: number, patch: Partial<TaskInput>) {
  return prisma.task.update({ where: { id }, data: patch });
}

export async function remove(id: number) {
  return prisma.task.delete({ where: { id } });
}
