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
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Historial de búsquedas</h1>
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s.id} className="border rounded p-3 flex justify-between">
            <span>
              <strong>{s.termino}</strong> — {s.totalMatches} coincidencia(s)
            </span>
            <span className="text-xs text-gray-500">
              {new Date(s.createdAt).toLocaleString('es-AR')} · {s.status}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
