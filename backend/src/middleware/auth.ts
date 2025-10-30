import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { t, getLanguageFromRequest } from '../utils/i18n';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const lang = getLanguageFromRequest(req);
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: t('auth.unauthorized', lang) });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded puede ser string o JwtPayload
    let subValue: string | number | undefined;

    if (typeof decoded === 'string') {
      // Caso raro: payload es una cadena
      subValue = decoded;
    } else if (typeof decoded === 'object' && decoded !== null) {
      subValue = (decoded as JwtPayload).sub;
    }

    // Convertir sub a number de forma segura
    let userId: number | undefined;
    if (typeof subValue === 'number') {
      userId = subValue;
    } else if (typeof subValue === 'string') {
      const parsed = Number(subValue);
      if (!Number.isNaN(parsed)) userId = parsed;
    }

    if (!userId) {
      return res.status(401).json({ error: t('auth.invalidTokenSubject', lang) });
    }

    // Set both userId (legacy) and user object (new standard)
    (req as any).userId = userId;
    req.user = { id: userId };
    next();
  } catch {
    return res.status(401).json({ error: t('auth.invalidToken', lang) });
  }
}

// Alias for consistency
export const authenticate = requireAuth;
