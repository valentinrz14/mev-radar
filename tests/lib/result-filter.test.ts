import { describe, expect, it } from 'vitest';
import { filterResults, matchesWholeWord, normalize, pickSearchToken } from '@/lib/result-filter';

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

  it('con varias palabras exige todas (en cualquier orden)', () => {
    // "Juan Lotti" (nombre apellido) matchea aunque MEV use "APELLIDO NOMBRE"
    expect(matchesWholeWord('BBVA S.A. C/ LOTTI JUAN JOSE S/ EJECUTIVO', 'Juan Lotti')).toBe(true);
    expect(matchesWholeWord('LOTTI JUAN C/ PEREZ', 'lotti juan')).toBe(true);
    // pero "lotti" tiene que ser palabra completa: BELLOTTI no cuenta
    expect(matchesWholeWord('BELLOTTI JUAN MANUEL C/ X', 'Juan Lotti')).toBe(false);
    // falta una de las palabras -> no matchea
    expect(matchesWholeWord('LOTTI MARIA C/ X', 'Juan Lotti')).toBe(false);
  });

  it('ignora comas, espacios de más y otra puntuación en el término', () => {
    expect(matchesWholeWord('LOTTI, JUAN JOSE C/ X', 'Lotti, Juan')).toBe(true);
    expect(matchesWholeWord('LOTTI JUAN C/ X', '  Juan   Lotti  ')).toBe(true);
    expect(matchesWholeWord('LOTTI JUAN C/ X', 'lotti/juan')).toBe(true);
  });
});

describe('pickSearchToken', () => {
  it('con una palabra devuelve esa palabra', () => {
    expect(pickSearchToken('Lotti')).toBe('Lotti');
    expect(pickSearchToken('  Lotti  ')).toBe('Lotti');
  });
  it('con varias palabras devuelve la más larga (el apellido distintivo)', () => {
    expect(pickSearchToken('Juan Lotti')).toBe('Lotti');
    expect(pickSearchToken('Lotti Juan')).toBe('Lotti');
    expect(pickSearchToken('Ana Rodriguez')).toBe('Rodriguez');
  });
  it('limpia puntuación al elegir el token que va a MEV', () => {
    // sin la limpieza, mandaría "Lotti," con la coma y MEV no devolvería nada
    expect(pickSearchToken('Lotti, Juan')).toBe('Lotti');
    expect(pickSearchToken('  Juan   Lotti  ')).toBe('Lotti');
  });
});

describe('filterResults', () => {
  it('separa matches de descartados', () => {
    const rows = [{ caratula: 'LOTTI JUAN C/ X' }, { caratula: 'LANCELOTTI PEDRO C/ Y' }];
    const { matches, discarded } = filterResults(rows, 'Lotti');
    expect(matches).toHaveLength(1);
    expect(discarded).toHaveLength(1);
    expect(matches[0].caratula).toContain('LOTTI JUAN');
  });
});
