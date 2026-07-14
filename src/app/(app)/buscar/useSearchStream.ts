'use client';
import { useCallback, useRef, useState } from 'react';

export type Match = {
  caratula: string;
  organismoName: string;
  // Todos los organismos donde apareció esta misma causa (mismo expediente).
  organismos: string[];
  nroExpediente: string;
  estado: string;
  fechaInicio: string;
  ultimoMovimiento: string;
  nidCausa: string;
  pidJuzgado: string;
};
export type Progress = { current: number; total: number; label: string };
export type DeptProgress = { current: number; total: number; name: string };
export type SearchModo = 'caratula' | 'expediente' | 'receptoria';

type RawMatch = Omit<Match, 'organismoName' | 'organismos'>;

// Misma causa = mismo nº de expediente. Si viene vacío, cae a nidCausa+pidJuzgado
// para no agrupar causas distintas por error.
function groupKey(m: RawMatch): string {
  const exp = m.nroExpediente.trim();
  return exp ? `exp:${exp.toLowerCase()}` : `id:${m.nidCausa}:${m.pidJuzgado}`;
}

type StartEventData = { total: number; departamento: string };
type DepartmentEventData = { index: number; total: number; name: string };
type OrganismEventData = {
  index: number;
  total: number;
  name: string;
  matches: RawMatch[];
  discardedCount?: number;
  error?: string;
};
type DoneEventData = { totalMatches: number };

export function useSearchStream(onDone: (total: number) => void) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [deptProgress, setDeptProgress] = useState<DeptProgress | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [discarded, setDiscarded] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  const start = useCallback(
    (departamento: string, termino: string, estado: string, modo: SearchModo, todos: boolean) => {
      setRunning(true);
      setMatches([]);
      setDiscarded(0);
      setProgress(null);
      setDeptProgress(null);
      const params = new URLSearchParams({ termino, estado, modo });
      if (todos) params.set('todos', '1');
      else params.set('departamento', departamento);
      const es = new EventSource(`/api/search?${params.toString()}`);
      esRef.current = es;
      es.addEventListener('start', (e) => {
        const d = JSON.parse((e as MessageEvent).data) as StartEventData;
        setProgress({ current: 0, total: d.total, label: d.departamento });
      });
      es.addEventListener('department', (e) => {
        const d = JSON.parse((e as MessageEvent).data) as DepartmentEventData;
        setDeptProgress({ current: d.index, total: d.total, name: d.name });
      });
      es.addEventListener('organism', (e) => {
        const d = JSON.parse((e as MessageEvent).data) as OrganismEventData;
        setProgress({ current: d.index, total: d.total, label: d.name });
        setDiscarded((x) => x + (d.discardedCount ?? 0));
        if (d.matches?.length) {
          setMatches((prev) => {
            // Agrupamos por expediente: si la causa ya apareció en otro organismo,
            // sumamos el organismo a su lista en vez de crear otra tarjeta.
            const byKey = new Map(prev.map((m) => [groupKey(m), m]));
            for (const raw of d.matches) {
              const k = groupKey(raw);
              const existing = byKey.get(k);
              if (existing) {
                if (!existing.organismos.includes(d.name)) {
                  byKey.set(k, { ...existing, organismos: [...existing.organismos, d.name] });
                }
              } else {
                byKey.set(k, { ...raw, organismoName: d.name, organismos: [d.name] });
              }
            }
            return Array.from(byKey.values());
          });
        }
      });
      es.addEventListener('done', (e) => {
        const d = JSON.parse((e as MessageEvent).data) as DoneEventData;
        setRunning(false);
        es.close();
        onDone(d.totalMatches);
      });
      es.addEventListener('error', () => {
        setRunning(false);
        es.close();
      });
    },
    [onDone],
  );

  return { running, progress, deptProgress, matches, discarded, start };
}
