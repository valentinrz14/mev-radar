'use client';
import { useCallback, useEffect, useState } from 'react';

export type FavMatch = {
  caratula: string;
  organismoName: string;
  nroExpediente: string;
  estado: string;
  fechaInicio: string;
  nidCausa: string;
  pidJuzgado: string;
};

const keyOf = (m: { nidCausa: string; pidJuzgado: string }) => `${m.nidCausa}:${m.pidJuzgado}`;

// Maneja el set de causas favoriteadas del usuario. Se carga una vez y expone
// helpers para consultar/togglear con actualización optimista.
export function useFavorites() {
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/favorites')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: FavMatch[]) => setKeys(new Set(Array.isArray(list) ? list.map(keyOf) : [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isFavorited = useCallback((m: FavMatch) => keys.has(keyOf(m)), [keys]);

  const toggle = useCallback(
    async (m: FavMatch) => {
      const k = keyOf(m);
      const has = keys.has(k);
      setKeys((prev) => {
        const next = new Set(prev);
        if (has) next.delete(k);
        else next.add(k);
        return next;
      });
      try {
        if (has) {
          await fetch(
            `/api/favorites?nidCausa=${encodeURIComponent(m.nidCausa)}&pidJuzgado=${encodeURIComponent(m.pidJuzgado)}`,
            { method: 'DELETE' },
          );
        } else {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(m),
          });
        }
      } catch {
        // revertir si falló la request
        setKeys((prev) => {
          const next = new Set(prev);
          if (has) next.add(k);
          else next.delete(k);
          return next;
        });
      }
    },
    [keys],
  );

  return { isFavorited, toggle, loading };
}
