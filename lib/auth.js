import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { user };
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  if (user.role !== 'admin') return { error: 'Forbidden: Admin access required', status: 403 };
  return { user };
}
