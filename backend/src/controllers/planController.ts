import { Request, Response, NextFunction } from 'express';
import * as planService from '../services/planService';
import { t, getLanguageFromRequest } from '../utils/i18n';

export async function listPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const lang = getLanguageFromRequest(req);
    const plans = await planService.getAllPlans();

    // Localize plan information
    const localizedPlans = plans.map((plan) => {
      const planKey = plan.name as 'free' | 'pro';
      return {
        id: plan.id,
        name: plan.name,
        displayName: t(`plan.${planKey}.name`, lang),
        description: t(`plan.${planKey}.description`, lang),
        priceMonthly: plan.priceMonthly,
        projectsQuota: plan.projectsQuota,
        features: [
          t(`plan.${planKey}.feature1`, lang),
          t(`plan.${planKey}.feature2`, lang),
          t(`plan.${planKey}.feature3`, lang),
        ],
      };
    });

    res.json(localizedPlans);
  } catch (error) {
    next(error);
  }
}
