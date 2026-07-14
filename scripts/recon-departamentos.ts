/**
 * Recon: vuelca el catálogo completo de departamentos judiciales de MEV.
 *
 * El <select name="DtoJudElegido"> que aparece después del login lista TODOS
 * los departamentos con su código interno. Con un solo login los sacamos todos.
 *
 * Uso (con tus credenciales MEV reales, NO se commitean):
 *   MEV_TEST_USER=tu_usuario MEV_TEST_PASS='tu_clave' bun scripts/recon-departamentos.ts
 *
 * El deptoRegistrado ("Creado en") por defecto es MO; cambialo con MEV_TEST_DEPTO
 * si tu usuario fue creado en otro (no afecta la lista de departamentos que sale).
 *
 * Imprime el array listo para pegar en src/lib/departamentos.ts (DEPARTAMENTOS).
 */
import { chromium } from 'playwright';

const BASE = process.env.MEV_BASE_URL ?? 'https://mev.scba.gov.ar';
const usuario = process.env.MEV_TEST_USER;
const clave = process.env.MEV_TEST_PASS;
const deptoRegistrado = process.env.MEV_TEST_DEPTO ?? 'MO';

if (!usuario || !clave) {
  console.error('Faltan credenciales. Ejemplo:');
  console.error(
    "  MEV_TEST_USER=tu_usuario MEV_TEST_PASS='tu_clave' bun scripts/recon-departamentos.ts",
  );
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`${BASE}/loguin.asp`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name=usuario]', usuario);
  await page.fill('input[name=clave]', clave);
  await page.selectOption('select[name=DeptoRegistrado]', deptoRegistrado);
  await Promise.all([page.waitForLoadState('domcontentloaded'), page.click('input[type=submit]')]);

  const select = await page.$('select[name=DtoJudElegido]');
  if (!select) {
    console.error(
      'Login falló o no apareció el selector de departamento. Revisá usuario/clave/depto.',
    );
    process.exit(2);
  }

  const opts = await page.$$eval('select[name=DtoJudElegido] option', (els) =>
    (els as HTMLOptionElement[])
      .map((o) => ({ code: o.value.trim(), name: (o.textContent ?? '').trim() }))
      .filter((o) => o.code.length > 0 && !/seleccione/i.test(o.name)),
  );

  console.log(`\nEncontrados ${opts.length} departamentos:\n`);
  console.log('export const DEPARTAMENTOS: Departamento[] = [');
  for (const o of opts) {
    console.log(`  { code: '${o.code}', name: ${JSON.stringify(o.name)}, deptoRegistrado: '' },`);
  }
  console.log('];');
  console.log(
    '\n(Completá deptoRegistrado con el value de DEPTOS_REGISTRADOS que corresponda a cada uno.)',
  );
} finally {
  await browser.close();
}
