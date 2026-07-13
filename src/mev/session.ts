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
    try {
      await s.login();
    } catch (e) {
      await ctx.close().catch(() => {});
      throw e;
    }
    return s;
  }

  private async login(): Promise<void> {
    const { page } = this;
    await page.goto(`${BASE}/loguin.asp`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name=usuario]', this.creds.usuario);
    await page.fill('input[name=clave]', this.creds.clave);
    await page.selectOption('select[name=DeptoRegistrado]', this.creds.deptoRegistrado);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.click('input[type=submit]'),
    ]);
    if (!(await page.$('select[name=DtoJudElegido]'))) {
      throw new Error('MEV_LOGIN_FAILED'); // credenciales inválidas
    }
    await page.check('input[name=TipoDto][value=CC]');
    await page.selectOption('select[name=DtoJudElegido]', this.departamentoCode);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.click('input[name=Aceptar]'),
    ]);
    await page.waitForSelector('select[name=JuzgadoElegido]', { timeout: 15_000 });
  }

  async ensureOnBusqueda(): Promise<void> {
    // La sesión de MEV se mantiene por cookie: normalmente alcanza con
    // navegar de vuelta al formulario de búsqueda (barato). Solo si la
    // sesión realmente expiró (el form no aparece) hacemos un login completo.
    await this.page.goto(`${BASE}/busqueda.asp`, { waitUntil: 'domcontentloaded' });
    if (await this.page.$('select[name=JuzgadoElegido]')) {
      return;
    }
    await this.login();
  }

  async close(): Promise<void> {
    await this.ctx.close();
  }
}
