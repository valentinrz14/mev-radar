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
  useEffect(() => {
    fetch('/api/searches')
      .then((r) => r.json())
      .then(setItems);
  }, []);
  return (
    <div>
      <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Registro
      </p>
      <h1 className="mt-1 text-[2rem] font-semibold text-[var(--ink)]">Historial de búsquedas</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--ink-soft)]">Todavía no hiciste ninguna búsqueda.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
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
