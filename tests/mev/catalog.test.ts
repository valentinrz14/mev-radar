import { describe, expect, it } from 'vitest';
import { readOrganisms } from '@/mev/catalog';

describe('readOrganisms', () => {
  it('lee value/text de las opciones, ignorando vacías', async () => {
    const fakePage = {
      $$eval: async (_sel: string, fn: (els: any[]) => any) =>
        fn([
          { value: 'GAM415  ', textContent: 'Cámara Civil - Sala 1ra.' },
          { value: 'GAM430  ', textContent: 'Juzgado Civil N° 1' },
          { value: '', textContent: 'Seleccione' },
        ]),
    } as any;
    const orgs = await readOrganisms(fakePage);
    expect(orgs).toEqual([
      { code: 'GAM415', name: 'Cámara Civil - Sala 1ra.' },
      { code: 'GAM430', name: 'Juzgado Civil N° 1' },
    ]);
  });
});
