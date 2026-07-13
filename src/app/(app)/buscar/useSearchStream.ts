'use client';
import { useCallback, useRef, useState } from 'react';

export type Match = {
  caratula: string;
  organismoName: string;
  nroExpediente: string;
  estado: string;
  fechaInicio: string;
  ultimoMovimiento: string;
  nidCausa: string;
  pidJuzgado: string;
};
export type Progress = { current: number; total: number; label: string };

type RawMatch = Omit<Match, 'organismoName'>;

type StartEventData = { total: number; departamento: string };
type OrganismEventData = {
  index: number;
  total: number;
  name: string;
  matches: RawMatch[];
  discardedCount?: number;
  error?: string;
};

export function useSearchStream(onDone: () => void) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [discarded, setDiscarded] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  const start = useCallback(
    (departamento: string, termino: string, estado: string) => {
      setRunning(true);
      setMatches([]);
      setDiscarded(0);
      setProgress(null);
      const es = new EventSource(
        `/api/search?departamento=${departamento}&termino=${encodeURIComponent(termino)}&estado=${estado}`,
      );
      esRef.current = es;
      es.addEventListener('start', (e) => {
        const d = JSON.parse((e as MessageEvent).data) as StartEventData;
        setProgress({ current: 0, total: d.total, label: d.departamento });
      });
      es.addEventListener('organism', (e) => {
        const d = JSON.parse((e as MessageEvent).data) as OrganismEventData;
        setProgress({ current: d.index, total: d.total, label: d.name });
        setDiscarded((x) => x + (d.discardedCount ?? 0));
        if (d.matches?.length) {
          setMatches((prev) => [
            ...prev,
            ...d.matches.map((m) => ({ ...m, organismoName: d.name })),
          ]);
        }
      });
      es.addEventListener('done', () => {
        setRunning(false);
        es.close();
        onDone();
      });
      es.addEventListener('error', () => {
        setRunning(false);
        es.close();
      });
    },
    [onDone],
  );

  return { running, progress, matches, discarded, start };
}
