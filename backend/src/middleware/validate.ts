import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e: any) {
      return res.status(400).json({ error: e.errors ?? e.message });
    }
  };
}
