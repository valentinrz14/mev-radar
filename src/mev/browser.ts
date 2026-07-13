import { type Browser, chromium } from 'playwright';

let browserPromise: Promise<Browser> | null = null;
export function getBrowser(): Promise<Browser> {
  if (!browserPromise) browserPromise = chromium.launch({ headless: true });
  return browserPromise;
}
export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    (await browserPromise).close();
    browserPromise = null;
  }
}
