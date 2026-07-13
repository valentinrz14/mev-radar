import { describe, it, expect, afterAll } from 'vitest';
import { MevSession } from '@/mev/session';
import { runSearch } from '@/mev/search-runner';
import { closeBrowser } from '@/mev/browser';

const RUN = process.env.MEV_LIVE === '1';
const d = RUN ? describe : describe.skip;
afterAll(async () => { await closeBrowser(); });

d('runSearch (live)', () => {
  it('busca LOTTI en Morón y filtra los falsos positivos', async () => {
    const s = await MevSession.open(
      { usuario: process.env.MEV_TEST_USER!, clave: process.env.MEV_TEST_PASS!, deptoRegistrado: 'MO' }, '19');
    const events: number[] = [];
    const results = await runSearch(s, 'LOTTI', 'Am', (i) => events.push(i));
    await s.close();
    expect(results.length).toBeGreaterThan(10); // 23 organismos
    expect(events.length).toBe(results.length); // callback una vez por organismo
    // "LOTTI" trae MUCHOS substrings (ANGELOTTI, LANCELOTTI, ...) que se descartan,
    // y también apellidos "Lotti" reales que SÍ deben quedar como matches.
    const totalMatches = results.reduce((a, r) => a + r.matches.length, 0);
    const totalDiscarded = results.reduce((a, r) => a + r.discardedCount, 0);
    expect(totalDiscarded).toBeGreaterThan(0); // se filtran falsos positivos
    expect(totalMatches).toBeGreaterThan(0); // hay apellidos "Lotti" reales en Morón
    // ningún match puede ser un substring tipo "...LOTTI" pegado a otra palabra
    for (const r of results) {
      for (const m of r.matches) {
        expect(/(^|[^a-zñáéíóú])lotti([^a-zñáéíóú]|$)/i.test(
          m.caratula.normalize('NFD').replace(/[̀-ͯ]/g, ''),
        )).toBe(true);
      }
    }
  }, 240_000);
});
