import { decryptSecret } from '@/lib/crypto';
import { getDepartamento } from '@/lib/departamentos';
import { prisma } from '@/lib/prisma';
import type { RawResult } from '@/lib/results-parser';
import { requireUser } from '@/lib/session';
import { isActive } from '@/lib/subscription';
import { TaskQueue } from '@/mev/queue';
import { runSearch } from '@/mev/search-runner';
import { MevSession } from '@/mev/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const queue = new TaskQueue(3);

type SsePayload =
  | { event: 'start'; data: { total: number; departamento: string } }
  | {
      event: 'organism';
      data: {
        index: number;
        total: number;
        name: string;
        matches: RawResult[];
        discardedCount: number;
        error?: string;
      };
    }
  | { event: 'done'; data: { totalMatches: number } }
  | { event: 'error'; data: { message: string } };

export async function GET(req: Request) {
  let userId: string;
  try {
    ({ userId } = await requireUser());
  } catch {
    return new Response('No autenticado', { status: 401 });
  }
  if (!(await isActive(userId))) {
    return new Response('Suscripción vencida', { status: 402 });
  }
  const url = new URL(req.url);
  const departamento = url.searchParams.get('departamento') ?? '19';
  const termino = (url.searchParams.get('termino') ?? '').trim();
  const estadoParam = url.searchParams.get('estado') ?? 'Am';
  const depto = getDepartamento(departamento);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (
    !termino ||
    !depto ||
    !user?.mevUsuario ||
    !user.mevClaveEncrypted ||
    !user.mevDeptoRegistrado
  ) {
    return new Response('Faltan datos', { status: 400 });
  }
  if (estadoParam !== 'Ac' && estadoParam !== 'Ar' && estadoParam !== 'Am') {
    return new Response('Estado inválido', { status: 400 });
  }
  const estado = estadoParam;
  const creds = {
    usuario: user.mevUsuario,
    clave: decryptSecret(user.mevClaveEncrypted),
    deptoRegistrado: user.mevDeptoRegistrado,
  };

  const encoder = new TextEncoder();
  const ac = new AbortController();
  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: SsePayload) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${payload.event}\ndata: ${JSON.stringify(payload.data)}\n\n`),
          );
        } catch {
          // el controller ya está cerrado (cliente desconectado en el medio de un enqueue)
        }
      };
      const search = await prisma.search.create({
        data: { userId, departamento, termino, estado, status: 'running' },
      });
      try {
        await queue.run(async () => {
          const session = await MevSession.open(creds, depto.code);
          try {
            let started = false;
            let totalMatches = 0;
            const results = await runSearch(
              session,
              termino,
              estado,
              (index, total, r) => {
                if (!started) {
                  send({ event: 'start', data: { total, departamento: depto.name } });
                  started = true;
                }
                totalMatches += r.matches.length;
                send({
                  event: 'organism',
                  data: {
                    index,
                    total,
                    name: r.name,
                    matches: r.matches,
                    discardedCount: r.discardedCount,
                    error: r.error,
                  },
                });
              },
              ac.signal,
            );
            // persistir resultados
            const flat = results.flatMap((r) =>
              r.matches.map((m) => ({
                searchId: search.id,
                organismoCode: r.code,
                organismoName: r.name,
                caratula: m.caratula,
                estado: m.estado,
                receptoria: m.receptoria,
                nroExpediente: m.nroExpediente,
                fechaInicio: m.fechaInicio,
                ultimoMovimiento: m.ultimoMovimiento,
                nidCausa: m.nidCausa,
                pidJuzgado: m.pidJuzgado,
              })),
            );
            if (flat.length) await prisma.searchResult.createMany({ data: flat });
            await prisma.search.update({
              where: { id: search.id },
              data: { status: 'done', totalMatches, finishedAt: new Date() },
            });
            send({ event: 'done', data: { totalMatches } });
          } finally {
            await session.close();
          }
        });
      } catch (e) {
        await prisma.search
          .update({ where: { id: search.id }, data: { status: 'error' } })
          .catch(() => {});
        send({ event: 'error', data: { message: e instanceof Error ? e.message : 'error' } });
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            // ya cerrado (ej: el cliente se desconectó y disparó cancel())
          }
        }
      }
    },
    cancel() {
      // el cliente se desconectó: cortar el scrape en curso y no volver a
      // enqueuear en un controller que ReadableStream ya considera cerrado.
      closed = true;
      ac.abort();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
