import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import { t, getLanguageFromRequest } from '../utils/i18n';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

export async function register(req: Request, res: Response) {
  const lang = getLanguageFromRequest(req);
  const { email, password, name } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: t('auth.emailInUse', lang) });
  const hashed = await hashPassword(password);
  
  // Create user and assign free plan in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the user
    const user = await tx.user.create({ data: { email, password: hashed, name } });
    
    // Get the free plan
    const freePlan = await tx.plan.findUnique({ where: { name: 'free' } });
    if (!freePlan) {
      throw new Error('Free plan not found. Please run seed script.');
    }
    
    // Create subscription with free plan
    await tx.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: 'active',
        startDate: new Date(),
        endDate: null, // Free plan doesn't expire
      },
    });
    
    return user;
  });

  // Generate JWT token for immediate login after signup
  const token = jwt.sign({ sub: result.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.status(201).json({
    accessToken: token,
    expiresIn: JWT_EXPIRES_IN,
    user: {
      id: result.id,
      email: result.email,
      name: result.name,
    },
  });
}

// Alias for signup (same as register)
export const signup = register;

export async function login(req: Request, res: Response) {
  const lang = getLanguageFromRequest(req);
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: t('auth.invalidCredentials', lang) });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: t('auth.invalidCredentials', lang) });
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({
    accessToken: token,
    expiresIn: JWT_EXPIRES_IN,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

// Alias for signin (same as login)
export const signin = login;
