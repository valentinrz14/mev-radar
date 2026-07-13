export type RawResult = {
  caratula: string; estado: string; receptoria: string; nroExpediente: string;
  fechaInicio: string; ultimoMovimiento: string; nidCausa: string; pidJuzgado: string;
};

const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export function parseResults(html: string): { rows: RawResult[]; total: number | null; excedeLimite: boolean } {
  const excedeLimite = /exceden el l[ií]mite permitido/i.test(html);
  const totalMatch = html.match(/Total Expedientes\s*:\s*(\d+)/i);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : null;

  const rows: RawResult[] = [];
  // Cada resultado empieza en un <a href="procesales.asp?nidCausa=..&pidJuzgado=..">CARATULA</a>
  const anchorRe = /<a\s+href="procesales\.asp\?nidCausa=(\d+)&(?:amp;)?pidJuzgado=([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const anchors = [...html.matchAll(anchorRe)];
  for (let i = 0; i < anchors.length; i++) {
    const m = anchors[i];
    const nidCausa = m[1];
    const pidJuzgado = m[2].trim();
    const caratula = strip(m[3]);
    if (!caratula) continue;
    // el segmento entre este anchor y el próximo contiene estado/receptoría/expte/fechas
    const start = m.index! + m[0].length;
    const end = i + 1 < anchors.length ? anchors[i + 1].index! : html.length;
    const segment = strip(html.slice(start, end));
    const estado = /FUERA DEL ORGANISMO/i.test(segment) ? 'FUERA DEL ORGANISMO'
      : (segment.match(/^([A-ZÁÉÍÓÚÑ ]+?)(?=[A-Z]?\s*-?\s*\d)/)?.[1]?.trim() ?? '');
    const recep = segment.match(/([A-Z]{1,3}\s*-\s*\d+\s*-\s*\d+|\d{4,})/)?.[1] ?? '';
    const fechas = segment.match(/\d{2}\/\d{2}\/\d{4}/g) ?? [];
    const pase = segment.match(/(\d{2}\/\d{2}\/\d{4}\s*-\s*[A-ZÁÉÍÓÚ ]+)/)?.[1] ?? '';
    rows.push({
      caratula, estado, receptoria: recep, nroExpediente: recep,
      fechaInicio: fechas[0] ?? '', ultimoMovimiento: pase || (fechas[1] ?? ''),
      nidCausa, pidJuzgado,
    });
  }
  return { rows, total, excedeLimite };
}
