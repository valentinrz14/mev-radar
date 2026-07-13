import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';
import { daysRemaining, subscriptionBadge } from '@/lib/subscription';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
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
        mevUsuario: u.mevUsuario,
        activado: u.mevClaveEncrypted != null,
        expiresAt: exp,
        daysRemaining: days,
        badge: subscriptionBadge(days),
        status: u.subscription?.status ?? 'none',
      };
    }),
  );
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  let body: {
    action?: string;
    userId?: string;
    mevUsuario?: string;
    email?: string;
    nombre?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (body.action === 'create') {
    const mevUsuario = body.mevUsuario?.trim();
    const email = body.email?.trim();
    const nombre = body.nombre?.trim();
    if (!mevUsuario || !nombre) {
      return NextResponse.json({ error: 'Usuario MEV y nombre son obligatorios' }, { status: 400 });
    }
    const expiresAt = new Date(Date.now() + 30 * 86_400_000);
    try {
      await prisma.user.create({
        data: {
          mevUsuario,
          email: email || null,
          nombre,
          role: 'lawyer',
          subscription: { create: { expiresAt } },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya existe un abogado con ese usuario MEV o email.' },
          { status: 409 },
        );
      }
      throw e;
    }
    return NextResponse.json({ ok: true });
  }

  if (!body.userId) {
    return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
  }

  if (body.action === 'renew') {
    const sub = await prisma.subscription.findUnique({ where: { userId: body.userId } });
    const now = new Date();
    const base = sub && sub.expiresAt > now ? sub.expiresAt : now;
    const expiresAt = new Date(base.getTime() + 30 * 86_400_000);
    await prisma.subscription.upsert({
      where: { userId: body.userId },
      create: { userId: body.userId, status: 'active', startsAt: now, expiresAt },
      update: { status: 'active', expiresAt },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'toggle') {
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
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
}
