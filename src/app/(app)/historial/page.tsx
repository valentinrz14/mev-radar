'use client';
import { useEffect, useState } from 'react';

type S = {
  id: string;
  termino: string;
  departamento: string;
  totalMatches: number;
  createdAt: string;
  status: string;
};
export default function HistorialPage() {
  const [items, setItems] = useState<S[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/searches')
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Registro
      </p>
      <h1 className="mt-1 text-[2rem] font-semibold text-[var(--ink)]">Historial de búsquedas</h1>

      {loading ? (
        <ul className="mt-6 flex list-none flex-col gap-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <span className="h-4 w-40 animate-pulse rounded bg-[var(--signal-soft)]" />
              <span className="h-3 w-28 animate-pulse rounded bg-[var(--signal-soft)]" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--ink-soft)]">Todavía no hiciste ninguna búsqueda.</p>
      ) : (
        <ul className="mt-6 flex list-none flex-col gap-3">
          {items.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <span className="text-sm text-[var(--ink)]">
                <strong className="font-[family-name:var(--font-display)] font-semibold">
                  {s.termino}
                </strong>{' '}
                — {s.totalMatches} coincidencia{s.totalMatches === 1 ? '' : 's'}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]">
                {new Date(s.createdAt).toLocaleString('es-AR')} · {s.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
