import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseResults } from '@/lib/results-parser';

const html = readFileSync('docs/superpowers/specs/recon-fixtures/results_lotti.html', 'utf8');

describe('parseResults', () => {
  it('extrae el total de expedientes', () => {
    const { total } = parseResults(html);
    expect(total).toBe(20);
  });
  it('extrae filas con nidCausa y pidJuzgado', () => {
    const { rows } = parseResults(html);
    expect(rows.length).toBeGreaterThan(0);
    const r = rows[0];
    expect(r.nidCausa).toMatch(/^\d+$/);
    expect(r.pidJuzgado).toMatch(/^GAM\d+/);
    expect(r.caratula.length).toBeGreaterThan(5);
  });
  it('detecta el tope de 1000', () => {
    const excede = parseResults('... Los resultados exceden el límite permitido: 1000 ...');
    expect(excede.excedeLimite).toBe(true);
  });
});
