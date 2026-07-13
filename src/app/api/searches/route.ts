import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
export async function GET() {
  const { userId } = await requireUser();
  const searches = await prisma.search.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      termino: true,
      departamento: true,
      totalMatches: true,
      createdAt: true,
      status: true,
    },
  });
  return NextResponse.json(searches);
}
