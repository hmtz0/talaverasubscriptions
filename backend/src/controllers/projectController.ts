import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const projects = await projectService.listUserProjects(userId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;

    const project = await projectService.createProject(userId, { name, description });
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof projectService.QuotaExceededError) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const projectId = parseInt(req.params.id, 10);

    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const result = await projectService.deleteProject(userId, projectId);

    if (result === null) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
}
