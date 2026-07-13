import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }
  const s = await getSession();
  s.userId = user.id;
  s.role = user.role;
  await s.save();
  return NextResponse.json({ ok: true, role: user.role });
}
