import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';
import { daysRemaining, subscriptionBadge } from '@/lib/subscription';

export async function GET() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    where: { role: 'lawyer' },
    include: { subscription: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(
    users.map((u) => {
      const exp = u.subscription?.expiresAt ?? null;
      const days = exp ? daysRemaining(exp) : 0;
      return {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        expiresAt: exp,
        daysRemaining: days,
        badge: subscriptionBadge(days),
        status: u.subscription?.status ?? 'none',
      };
    }),
  );
}

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  if (body.action === 'create') {
    const passwordHash = await hashPassword(body.password);
    const expiresAt = new Date(Date.now() + 30 * 86_400_000);
    await prisma.user.create({
      data: {
        email: body.email,
        nombre: body.nombre,
        passwordHash,
        role: 'lawyer',
        subscription: { create: { expiresAt } },
      },
    });
  } else if (body.action === 'renew') {
    const sub = await prisma.subscription.findUnique({ where: { userId: body.userId } });
    const base = sub && sub.expiresAt > new Date() ? sub.expiresAt : new Date();
    await prisma.subscription.update({
      where: { userId: body.userId },
      data: { status: 'active', expiresAt: new Date(base.getTime() + 30 * 86_400_000) },
    });
  } else if (body.action === 'toggle') {
    const sub = await prisma.subscription.findUnique({ where: { userId: body.userId } });
    await prisma.subscription.update({
      where: { userId: body.userId },
      data: { status: sub?.status === 'active' ? 'canceled' : 'active' },
    });
  } else if (body.action === 'reset') {
    await prisma.user.update({
      where: { id: body.userId },
      data: { passwordHash: await hashPassword(body.password) },
    });
  }
  return NextResponse.json({ ok: true });
}
