import { describe, it, expect } from 'vitest';
import { normalize, matchesWholeWord, filterResults } from '@/lib/result-filter';

describe('normalize', () => {
  it('baja mayúsculas y saca acentos', () => {
    expect(normalize('ANDRÉ, Isabel Ñ')).toBe('andre, isabel n');
  });
});

describe('matchesWholeWord', () => {
  it('matchea el apellido como palabra suelta', () => {
    expect(matchesWholeWord('LOTTI JUAN C/ PEREZ S/ DAÑOS', 'Lotti')).toBe(true);
    expect(matchesWholeWord('PEREZ C/ LOTTI, MARIA S/ COBRO', 'lotti')).toBe(true);
  });
  it('NO matchea cuando es substring de otra palabra (casos reales de la recon)', () => {
    for (const c of [
      'ANDRE, ISABEL E. C/ ANGELOTTI, TERESA Y OT. S/ EJECUTIVO',
      'BELLOTTI JUAN MANUEL C/ CHECHIK S.A.',
      'BERTOLOTTI HECTOR C/ TRANSPORTE',
      'CASTELLANO C/ LANCELOTTI MARIA ELENA S/ COBRO',
      'CIMBARO C/ PERLOTTI ELIAS S/ EJECUCION',
      'DONZELLI C/ MERLOTTI MIRNA S/ DESALOJO',
      'TOLOTTI MAXIMILIANO C/ EMPRESA LINEA 216',
    ]) {
      expect(matchesWholeWord(c, 'Lotti')).toBe(false);
    }
  });
});

describe('filterResults', () => {
  it('separa matches de descartados', () => {
    const rows = [
      { caratula: 'LOTTI JUAN C/ X' },
      { caratula: 'LANCELOTTI PEDRO C/ Y' },
    ];
    const { matches, discarded } = filterResults(rows, 'Lotti');
    expect(matches).toHaveLength(1);
    expect(discarded).toHaveLength(1);
    expect(matches[0].caratula).toContain('LOTTI JUAN');
  });
});
