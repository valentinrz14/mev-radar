import { NextResponse } from 'next/server';
import { encryptSecret } from '@/lib/crypto';
import { isDeptoRegistrado } from '@/lib/departamentos';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { daysRemaining } from '@/lib/subscription';
import { MevSession } from '@/mev/session';

// Login de abogado: valida usuario/clave contra MEV en vivo (Playwright).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { usuario?: string; clave?: string; deptoRegistrado?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 });
  }
  const usuario = body.usuario?.trim();
  const clave = body.clave;
  const deptoRegistrado = body.deptoRegistrado;
  if (!usuario || !clave || !deptoRegistrado || !isDeptoRegistrado(deptoRegistrado)) {
    return NextResponse.json(
      { error: 'Completá usuario, contraseña y "Creado en".' },
      { status: 400 },
    );
  }

  // El abogado debe estar habilitado por el estudio (pre-registrado por su usuario MEV).
  const user = await prisma.user.findUnique({
    where: { mevUsuario: usuario },
    include: { subscription: true },
  });
  if (!user || user.role !== 'lawyer') {
    return NextResponse.json(
      { error: 'Tu usuario no está habilitado. Contactá al estudio.' },
      { status: 401 },
    );
  }

  const sub = user.subscription;
  if (!sub || sub.status !== 'active' || daysRemaining(sub.expiresAt) <= 0) {
    return NextResponse.json(
      { error: 'Tu suscripción está vencida. Contactá al estudio.' },
      { status: 403 },
    );
  }

  // Validación en vivo contra MEV.
  const ok = await MevSession.validateCredentials({ usuario, clave, deptoRegistrado });
  if (!ok) {
    return NextResponse.json(
      { error: 'Usuario o contraseña de MEV incorrectos.' },
      { status: 401 },
    );
  }

  // Guardamos la clave encriptada (se usa para las búsquedas) y el depto.
  await prisma.user.update({
    where: { id: user.id },
    data: { mevClaveEncrypted: encryptSecret(clave), mevDeptoRegistrado: deptoRegistrado },
  });

  const s = await getSession();
  s.userId = user.id;
  s.role = 'lawyer';
  await s.save();
  return NextResponse.json({ ok: true, role: 'lawyer' });
}
