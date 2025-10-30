import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';
import { t, getLanguageFromRequest } from '../utils/i18n';

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
    const lang = getLanguageFromRequest(req);
    const userId = req.user!.id;
    const { name, description } = req.body;

    const project = await projectService.createProject(userId, { name, description });
    res.status(201).json(project);
  } catch (error) {
    const lang = getLanguageFromRequest(req);
    if (error instanceof projectService.QuotaExceededError) {
      // Extraer el límite dinámico del mensaje de error
      const match = /Maximum (\d+) projects/.exec(error.message);
      const limit = match ? match[1] : '3';
      return res.status(403).json({
        error: t('project.quotaExceeded', lang, { limit }),
      });
    }
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const lang = getLanguageFromRequest(req);
    const userId = req.user!.id;
    const projectId = parseInt(req.params.id, 10);

    if (isNaN(projectId)) {
      return res.status(400).json({ error: t('project.invalidId', lang) });
    }

    const result = await projectService.deleteProject(userId, projectId);

    if (result === null) {
      return res.status(404).json({ error: t('project.notFound', lang) });
    }

    res.status(204).send();
  } catch (error) {
    const lang = getLanguageFromRequest(req);
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      return res.status(403).json({ error: t('project.forbidden', lang) });
    }
    next(error);
  }
}
