import { Request, Response, NextFunction } from 'express';
import * as subscriptionService from '../services/subscriptionService';
import { t, getLanguageFromRequest } from '../utils/i18n';

export async function createSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const lang = getLanguageFromRequest(req);
    const userId = req.user!.id;
    const { planId } = req.body;

    const subscription = await subscriptionService.createSubscription(userId, planId);

    res.status(201).json({
      message: t('subscription.created', lang),
      subscription: {
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
      },
    });
  } catch (error) {
    const lang = getLanguageFromRequest(req);

    if (error instanceof subscriptionService.SubscriptionAlreadyActiveError) {
      return res.status(400).json({
        error: t('subscription.alreadyActive', lang),
      });
    }

    if (error instanceof subscriptionService.InvalidPlanError) {
      return res.status(400).json({
        error: t('subscription.invalidPlan', lang),
      });
    }

    next(error);
  }
}

export async function getCurrentSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const lang = getLanguageFromRequest(req);
    const userId = req.user!.id;

    const subscription = await subscriptionService.getCurrentSubscription(userId);

    res.json({
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    });
  } catch (error) {
    const lang = getLanguageFromRequest(req);

    if (error instanceof subscriptionService.SubscriptionNotFoundError) {
      return res.status(404).json({
        error: t('subscription.notFound', lang),
      });
    }

    next(error);
  }
}

export async function cancelCurrentSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const lang = getLanguageFromRequest(req);
    const userId = req.user!.id;
    await subscriptionService.cancelCurrentSubscription(userId);
    res.status(204).send();
  } catch (error) {
    const lang = getLanguageFromRequest(req);
    if (error instanceof subscriptionService.SubscriptionNotFoundError) {
      return res.status(404).json({ error: t('subscription.notFound', lang) });
    }
    next(error);
  }
}
