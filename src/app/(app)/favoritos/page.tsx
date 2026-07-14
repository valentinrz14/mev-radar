'use client';
import { useEffect, useState } from 'react';
import { MatchCard } from '../MatchCard';
import type { FavMatch } from '../useFavorites';

type Favorite = FavMatch & { id: string };

export default function FavoritosPage() {
  const [items, setItems] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/favorites')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function remove(f: Favorite) {
    setItems((prev) => prev.filter((x) => x.id !== f.id));
    await fetch(
      `/api/favorites?nidCausa=${encodeURIComponent(f.nidCausa)}&pidJuzgado=${encodeURIComponent(f.pidJuzgado)}`,
      { method: 'DELETE' },
    ).catch(() => {});
  }

  return (
    <div>
      <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Guardadas
      </p>
      <h1 className="mt-1 text-[2rem] font-semibold text-[var(--ink)]">Favoritos</h1>

      {loading ? (
        <ul className="mt-6 flex list-none flex-col gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-[86px] animate-pulse rounded-[10px] border border-[var(--line)] bg-[var(--signal-soft)]"
            />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--ink-soft)]">
          Todavía no marcaste ninguna causa como favorita. Tocá la estrella ☆ en un resultado de
          búsqueda para guardarla acá.
        </p>
      ) : (
        <ul className="mt-6 flex list-none flex-col gap-3">
          {items.map((f) => (
            <li key={f.id}>
              <MatchCard match={f} favorited onToggle={() => remove(f)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
