import { normalize } from './normalize';
export { normalize };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchesWholeWord(caratula: string, termino: string): boolean {
  const t = normalize(termino).trim();
  if (!t) return false;
  // límites de palabra: no precedido ni seguido por letra/dígito
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(t)}([^\\p{L}\\p{N}]|$)`, 'u');
  return re.test(normalize(caratula));
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
