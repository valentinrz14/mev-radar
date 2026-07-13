import type { Page } from 'playwright';
import { MevSession } from './session';
import { readOrganisms } from './catalog';
import { parseResults, type RawResult } from '@/lib/results-parser';
import { filterResults } from '@/lib/result-filter';

const BASE = process.env.MEV_BASE_URL ?? 'https://mev.scba.gov.ar';

export type OrganismResult = {
  code: string; name: string; matches: RawResult[]; discardedCount: number; error?: string;
};

export async function searchOrganism(
  page: Page, code: string, termino: string, estado: string,
): Promise<{ html: string }> {
  if (!page.url().toLowerCase().includes('busqueda.asp')) {
    await page.goto(`${BASE}/busqueda.asp`, { waitUntil: 'domcontentloaded' });
  }
  await page.selectOption('select[name=JuzgadoElegido]', code);
  await page.check('input[name=radio][value=xCa]');
  await page.fill('input[name=caratula]', termino);
  await page.check(`input[name=TipoCausa][value=${estado}]`);
  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    page.click('input[name=Buscar]'),
  ]);
  // algunas búsquedas re-renderizan la misma URL: esperar por contenido conocido
  await page.waitForFunction(
    () => /Total Expedientes|exceden el l[ií]mite|Nueva B[uú]squeda/i.test(document.body.innerText),
    { timeout: 20_000 },
  ).catch(() => {});
  return { html: await page.content() };
}

const MAX_PAGES = 60;

/**
 * Ejecuta la búsqueda para un organismo y recorre todas las páginas de
 * resultados (link "Siguiente"), acumulando y dedupeando filas por
 * nidCausa. `total` y `excedeLimite` se toman de la primera página: si
 * excede el límite no hay filas/paginación que recorrer.
 */
async function collectOrganismRows(
  page: Page, code: string, termino: string, estado: string,
): Promise<{ rows: RawResult[]; total: number | null; excedeLimite: boolean }> {
  const { html: firstHtml } = await searchOrganism(page, code, termino, estado);
  const first = parseResults(firstHtml);
  if (first.excedeLimite) {
    return { rows: [], total: first.total, excedeLimite: true };
  }

  const seen = new Set<string>();
  const rows: RawResult[] = [];
  for (const r of first.rows) {
    if (seen.has(r.nidCausa)) continue;
    seen.add(r.nidCausa);
    rows.push(r);
  }

  let prevFirstNid = first.rows[0]?.nidCausa;
  for (let p = 1; p < MAX_PAGES; p++) {
    const next = page.locator('a', { hasText: /^\s*Siguiente\s*$/ }).first();
    if (await next.count() === 0) break;
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      next.click(),
    ]);
    await page.waitForFunction(
      () => /Total Expedientes|Nueva B[uú]squeda/i.test(document.body.innerText),
      { timeout: 20_000 },
    ).catch(() => {});
    const html = await page.content();
    const parsed = parseResults(html);
    const currentFirstNid = parsed.rows[0]?.nidCausa;
    if (currentFirstNid !== undefined && currentFirstNid === prevFirstNid) break; // no avanzó: cortar
    for (const r of parsed.rows) {
      if (seen.has(r.nidCausa)) continue;
      seen.add(r.nidCausa);
      rows.push(r);
    }
    prevFirstNid = currentFirstNid;
  }

  return { rows, total: first.total, excedeLimite: false };
}

export async function runSearch(
  session: MevSession,
  termino: string,
  estado: 'Ac' | 'Ar' | 'Am',
  onOrganism: (index: number, total: number, r: OrganismResult) => void,
): Promise<OrganismResult[]> {
  await session.ensureOnBusqueda();
  const organisms = await readOrganisms(session.page);
  const out: OrganismResult[] = [];
  for (let i = 0; i < organisms.length; i++) {
    const org = organisms[i];
    let result: OrganismResult;
    try {
      await session.ensureOnBusqueda();
      const collected = await collectOrganismRows(session.page, org.code, termino, estado);
      if (collected.excedeLimite) {
        result = { code: org.code, name: org.name, matches: [], discardedCount: 0,
          error: 'Demasiados resultados (>1000): agregá más texto a la búsqueda.' };
      } else {
        const { matches, discarded } = filterResults(collected.rows, termino);
        result = { code: org.code, name: org.name, matches, discardedCount: discarded.length };
      }
    } catch (e) {
      result = { code: org.code, name: org.name, matches: [], discardedCount: 0,
        error: e instanceof Error ? e.message : 'error desconocido' };
    }
    out.push(result);
    onOrganism(i + 1, organisms.length, result);
  }
  return out;
}
