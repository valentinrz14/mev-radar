import { getIronSession, type IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = { userId?: string; role?: 'lawyer' | 'admin' };
const options = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'mevradar_session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const },
};
export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), options);
}
export async function requireUser(): Promise<{ userId: string; role: string }> {
  const s = await getSession();
  if (!s.userId) throw new Error('UNAUTHENTICATED');
  return { userId: s.userId, role: s.role ?? 'lawyer' };
}
export async function requireAdmin(): Promise<{ userId: string }> {
  const s = await getSession();
  if (s.role !== 'admin') throw new Error('FORBIDDEN');
  return { userId: s.userId! };
}
