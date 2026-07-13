import { NextResponse } from 'next/server';
import { encryptSecret } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export async function GET() {
  const { userId } = await requireUser();
  const c = await prisma.mevCredential.findUnique({ where: { userId } });
  return NextResponse.json(
    c ? { mevUsuario: c.mevUsuario, mevDeptoRegistrado: c.mevDeptoRegistrado } : null,
  );
}

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const { mevUsuario, mevClave, mevDeptoRegistrado } = await req.json();
  if (!mevUsuario || !mevClave || !mevDeptoRegistrado) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  const data = { mevUsuario, mevClaveEncrypted: encryptSecret(mevClave), mevDeptoRegistrado };
  await prisma.mevCredential.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  return NextResponse.json({ ok: true });
}
