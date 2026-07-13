import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await params;
  const search = await prisma.search.findFirst({
    where: { id, userId },
    include: { results: true },
  });
  if (!search) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json(search);
}
