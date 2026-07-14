import { describe, expect, it } from 'vitest';
import { MODO_FIELD, type SearchModo, searchOrganism } from '@/mev/search-runner';

// Fake Page mínima que registra qué radio se tildó y qué campo se completó,
// para verificar que cada modo de búsqueda usa el selector correcto.
function makeFakePage() {
  const checked: string[] = [];
  const filled: { selector: string; value: string }[] = [];
  const page = {
    url: () => 'https://mev.scba.gov.ar/busqueda.asp',
    $$eval: async (_sel: string, _fn: unknown, code: string) => code, // realValue = code
    selectOption: async () => {},
    check: async (selector: string) => {
      checked.push(selector);
    },
    fill: async (selector: string, value: string) => {
      filled.push({ selector, value });
    },
    waitForLoadState: async () => {},
    click: async () => {},
    waitForFunction: async () => {},
    content: async () => '<html><body>Total Expedientes : 0</body></html>',
  };
  return { page: page as never, checked, filled };
}

describe('searchOrganism · modo', () => {
  const casos: { modo: SearchModo; radio: string; field: string }[] = [
    { modo: 'caratula', radio: 'xCa', field: 'caratula' },
    { modo: 'expediente', radio: 'xNc', field: 'NCausa' },
    { modo: 'receptoria', radio: 'xNr', field: 'NInterno' },
  ];

  for (const c of casos) {
    it(`modo ${c.modo} tilda ${c.radio} y completa ${c.field}`, async () => {
      const { page, checked, filled } = makeFakePage();
      await searchOrganism(page, 'GAM415', 'algo', 'Am', c.modo);
      expect(checked).toContain(`input[name=radio][value=${c.radio}]`);
      expect(filled).toContainEqual({ selector: `input[name=${c.field}]`, value: 'algo' });
      // el TipoCausa (estado) se tilda siempre, sin importar el modo
      expect(checked).toContain('input[name=TipoCausa][value=Am]');
    });
  }

  it('MODO_FIELD mapea los tres modos', () => {
    expect(MODO_FIELD.caratula).toEqual({ radio: 'xCa', field: 'caratula' });
    expect(MODO_FIELD.expediente).toEqual({ radio: 'xNc', field: 'NCausa' });
    expect(MODO_FIELD.receptoria).toEqual({ radio: 'xNr', field: 'NInterno' });
  });
});
