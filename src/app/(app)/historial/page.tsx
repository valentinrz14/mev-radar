'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type S = {
  id: string;
  termino: string;
  departamento: string;
  modo: string;
  totalMatches: number;
  createdAt: string;
  status: string;
};
// Link a /buscar que repite esta búsqueda. Departamento 'TODOS' → barrido completo.
function hrefForSearch(s: S): string {
  const params = new URLSearchParams({ termino: s.termino, modo: s.modo });
  if (s.departamento === 'TODOS') params.set('todos', '1');
  else params.set('departamento', s.departamento);
  return `/buscar?${params.toString()}`;
}

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
            <li key={s.id}>
              <Link
                href={hrefForSearch(s)}
                className="flex items-center justify-between rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--seal)] hover:bg-[var(--signal-soft)]"
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
