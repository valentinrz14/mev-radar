import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Login del admin: email + contraseña. Los abogados usan /api/auth/mev-login.
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 });
  }
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    user.role !== 'admin' ||
    !user.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }
  const s = await getSession();
  s.userId = user.id;
  s.role = 'admin';
  await s.save();
  return NextResponse.json({ ok: true, role: 'admin' });
}
