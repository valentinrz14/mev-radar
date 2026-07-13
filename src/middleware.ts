import { getIronSession } from 'iron-session';
import { type NextRequest, NextResponse } from 'next/server';
import type { SessionData } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, {
    password: process.env.SESSION_SECRET!,
    cookieName: 'mevradar_session',
  });
  const isLogin = req.nextUrl.pathname === '/login';
  if (!session.userId && !isLogin) return NextResponse.redirect(new URL('/login', req.url));
  if (session.userId && session.role !== 'admin' && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/buscar', req.url));
  }
  return res;
}

export const config = {
  matcher: ['/buscar/:path*', '/historial/:path*', '/perfil/:path*', '/admin/:path*'],
};
