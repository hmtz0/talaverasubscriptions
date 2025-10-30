import { Request, Response } from 'express';
import * as service from '../services/taskService';

export async function createTask(req: Request, res: Response) {
  const userId = (req as any).userId as number;
  const task = await service.create({ ...req.body, ownerId: userId });
  res.status(201).json(task);
}

export async function listTasks(req: Request, res: Response) {
  const userId = (req as any).userId as number;
  const tasks = await service.findByOwner(userId, req.query);
  res.json(tasks);
}

export async function getTask(req: Request, res: Response) {
  const t = await service.findById(Number(req.params.id));
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
}

export async function updateTask(req: Request, res: Response) {
  const updated = await service.update(Number(req.params.id), req.body);
  res.json(updated);
}

export async function deleteTask(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.status(204).send();
}
