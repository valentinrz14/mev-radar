import { afterAll, describe, expect, it } from 'vitest';
import { closeBrowser } from '@/mev/browser';
import { MevSession } from '@/mev/session';

const RUN = process.env.MEV_LIVE === '1';
const d = RUN ? describe : describe.skip;

afterAll(async () => {
  await closeBrowser();
});

d('MevSession (live)', () => {
  it('logea y llega a busqueda.asp con los organismos de Morón', async () => {
    const s = await MevSession.open(
      {
        usuario: process.env.MEV_TEST_USER!,
        clave: process.env.MEV_TEST_PASS!,
        deptoRegistrado: 'MO',
      },
      '19',
    );
    expect(s.page.url().toLowerCase()).toContain('busqueda.asp');
    const count = await s.page.$$eval('select[name=JuzgadoElegido] option', (o) => o.length);
    expect(count).toBeGreaterThan(10);
    await s.close();
  }, 60_000);
});
