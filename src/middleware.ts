import { getIronSession } from 'iron-session';
import { type NextRequest, NextResponse } from 'next/server';
import type { SessionData } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, {
    password: process.env.SESSION_SECRET!,
    cookieName: 'mevradar_session',
  });
  const { pathname } = req.nextUrl;
  const { userId, role } = session;

  // Home: sin sesión -> login; con sesión -> a la pantalla que corresponde.
  if (pathname === '/') {
    if (!userId) return NextResponse.redirect(new URL('/login', req.url));
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/buscar', req.url));
  }

  // Área de admin (excepto su propio login): requiere rol admin.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!userId) return NextResponse.redirect(new URL('/admin/login', req.url));
    if (role !== 'admin') return NextResponse.redirect(new URL('/buscar', req.url));
    return res;
  }

  // Login de admin: público.
  if (pathname === '/admin/login') return res;

  // Rutas de abogado (/buscar, /historial): requieren sesión.
  if (!userId) return NextResponse.redirect(new URL('/login', req.url));
  return res;
}

export const config = {
  matcher: ['/', '/buscar/:path*', '/historial/:path*', '/admin/:path*'],
};
