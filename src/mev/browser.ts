import { type Browser, chromium } from 'playwright';

let browserPromise: Promise<Browser> | null = null;
export function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      // Flags necesarios para correr Chromium dentro de un contenedor (Railway):
      // sin sandbox (corre como root) y sin /dev/shm chico (evita crashes por memoria).
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
  }
  return browserPromise;
}
export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    (await browserPromise).close();
    browserPromise = null;
  }
}
