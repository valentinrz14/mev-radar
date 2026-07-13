import type { BrowserContext, Page } from 'playwright';
import { getBrowser } from './browser';

const BASE = process.env.MEV_BASE_URL ?? 'https://mev.scba.gov.ar';
export type MevCreds = { usuario: string; clave: string; deptoRegistrado: string };

export class MevSession {
  private constructor(
    readonly ctx: BrowserContext,
    readonly page: Page,
    private readonly creds: MevCreds,
    private readonly departamentoCode: string,
  ) {}

  static async open(creds: MevCreds, departamentoCode: string): Promise<MevSession> {
    const browser = await getBrowser();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const s = new MevSession(ctx, page, creds, departamentoCode);
    await s.login();
    return s;
  }

  private async login(): Promise<void> {
    const { page, creds, departamentoCode } = this;
    await page.goto(`${BASE}/loguin.asp`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name=usuario]', creds.usuario);
    await page.fill('input[name=clave]', creds.clave);
    await page.selectOption('select[name=DeptoRegistrado]', creds.deptoRegistrado);
    await Promise.all([page.waitForLoadState('domcontentloaded'), page.click('input[type=submit]')]);
    if (!(await page.$('select[name=DtoJudElegido]'))) {
      throw new Error('MEV_LOGIN_FAILED'); // credenciales inválidas
    }
    await page.check('input[name=TipoDto][value=CC]');
    await page.selectOption('select[name=DtoJudElegido]', departamentoCode);
    await Promise.all([page.waitForLoadState('domcontentloaded'), page.click('input[name=Aceptar]')]);
    await page.waitForSelector('select[name=JuzgadoElegido]', { timeout: 15_000 });
  }

  async ensureOnBusqueda(): Promise<void> {
    if (!this.page.url().toLowerCase().includes('busqueda.asp') || !(await this.page.$('select[name=JuzgadoElegido]'))) {
      await this.login();
    }
  }

  async close(): Promise<void> { await this.ctx.close(); }
}
