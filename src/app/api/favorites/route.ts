import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

async function auth(): Promise<string | null> {
  try {
    const { userId } = await requireUser();
    return userId;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await auth();
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(favorites);
}

export async function POST(req: Request) {
  const userId = await auth();
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const b = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!b?.nidCausa || !b?.pidJuzgado || !b?.caratula) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  const data = {
    caratula: b.caratula,
    organismoName: b.organismoName ?? '',
    estado: b.estado ?? '',
    nroExpediente: b.nroExpediente ?? '',
    fechaInicio: b.fechaInicio ?? '',
    nidCausa: b.nidCausa,
    pidJuzgado: b.pidJuzgado,
  };
  const fav = await prisma.favorite.upsert({
    where: {
      userId_nidCausa_pidJuzgado: { userId, nidCausa: b.nidCausa, pidJuzgado: b.pidJuzgado },
    },
    create: { userId, ...data },
    update: data,
  });
  return NextResponse.json(fav);
}

export async function DELETE(req: Request) {
  const userId = await auth();
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const url = new URL(req.url);
  const nidCausa = url.searchParams.get('nidCausa');
  const pidJuzgado = url.searchParams.get('pidJuzgado');
  if (!nidCausa || !pidJuzgado) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  await prisma.favorite.deleteMany({ where: { userId, nidCausa, pidJuzgado } });
  return NextResponse.json({ ok: true });
}
