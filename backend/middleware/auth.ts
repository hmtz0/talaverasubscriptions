import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = (req.headers.authorization || '').split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth[1], JWT_SECRET) as { sub: number };
    (req as any).userId = Number(payload.sub);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}