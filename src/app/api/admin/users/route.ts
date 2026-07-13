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
    const now = new Date();
    const base = sub && sub.expiresAt > now ? sub.expiresAt : now;
    const expiresAt = new Date(base.getTime() + 30 * 86_400_000);
    await prisma.subscription.upsert({
      where: { userId: body.userId },
      create: { userId: body.userId, status: 'active', startsAt: now, expiresAt },
      update: { status: 'active', expiresAt },
    });
  } else if (body.action === 'toggle') {
    const sub = await prisma.subscription.findUnique({ where: { userId: body.userId } });
    const now = new Date();
    await prisma.subscription.upsert({
      where: { userId: body.userId },
      create: {
        userId: body.userId,
        status: 'active',
        startsAt: now,
        expiresAt: new Date(now.getTime() + 30 * 86_400_000),
      },
      update: { status: sub?.status === 'active' ? 'canceled' : 'active' },
    });
  } else if (body.action === 'reset') {
    await prisma.user.update({
      where: { id: body.userId },
      data: { passwordHash: await hashPassword(body.password) },
    });
  } else {
    return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
