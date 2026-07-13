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
    const results = await runSearch(s, 'LOTTI', 'Am', (i, total) => events.push(i));
    await s.close();
    expect(results.length).toBeGreaterThan(10); // 23 organismos
    // "LOTTI" da muchos substrings pero ningún apellido "Lotti" real → matches 0 en la mayoría
    const totalMatches = results.reduce((a, r) => a + r.matches.length, 0);
    const totalDiscarded = results.reduce((a, r) => a + r.discardedCount, 0);
    expect(totalDiscarded).toBeGreaterThan(0);
    expect(totalMatches).toBe(0);
  }, 180_000);
});
