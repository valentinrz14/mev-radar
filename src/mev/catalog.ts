import type { Page } from 'playwright';

export async function readOrganisms(page: Page): Promise<{ code: string; name: string }[]> {
  const raw = await page.$$eval('select[name=JuzgadoElegido] option', (opts) =>
    (opts as HTMLOptionElement[]).map((o) => ({ value: o.value, text: o.textContent ?? '' })));
  return raw
    .map((o) => ({ code: o.value.trim(), name: o.text.trim() }))
    .filter((o) => o.code.length > 0);
}
