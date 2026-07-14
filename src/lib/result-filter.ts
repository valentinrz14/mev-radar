import { normalize } from './normalize';

export { normalize };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Cada palabra del término debe aparecer como palabra completa en la carátula,
// en cualquier orden. Así "Juan Lotti" matchea "LOTTI, JUAN JOSE" (MEV usa el
// orden APELLIDO NOMBRE) pero NO "BELLOTTI JUAN" (ahí "lotti" es substring).
export function matchesWholeWord(caratula: string, termino: string): boolean {
  const words = normalize(termino).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const hay = normalize(caratula);
  return words.every((w) =>
    // límites de palabra: no precedido ni seguido por letra/dígito
    new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(w)}([^\\p{L}\\p{N}]|$)`, 'u').test(hay),
  );
}

// Palabra más distintiva para mandarle a MEV (que busca por substring literal y
// sensible al orden): la más larga suele ser el apellido. Con una sola palabra,
// es esa misma. El filtro local después exige todas las palabras.
export function pickSearchToken(termino: string): string {
  const words = termino.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return termino.trim();
  return words.reduce((a, b) => (normalize(b).length > normalize(a).length ? b : a));
}

export function filterResults<T extends { caratula: string }>(
  rows: T[],
  termino: string,
): { matches: T[]; discarded: T[] } {
  const matches: T[] = [];
  const discarded: T[] = [];
  for (const r of rows) (matchesWholeWord(r.caratula, termino) ? matches : discarded).push(r);
  return { matches, discarded };
}
