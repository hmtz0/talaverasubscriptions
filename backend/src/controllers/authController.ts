import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });

  // Generate JWT token for immediate login after signup
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.status(201).json({
    accessToken: token,
    expiresIn: JWT_EXPIRES_IN,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

// Alias for signup (same as register)
export const signup = register;

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
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
