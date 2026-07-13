'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEPTOS_REGISTRADOS } from '@/lib/departamentos';
import { RadarMark } from '../(app)/RadarMark';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [deptoRegistrado, setDeptoRegistrado] = useState('MO');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/mev-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usuario, clave, deptoRegistrado }),
      });
      if (res.ok) {
        router.push('/buscar');
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'No se pudo ingresar. Intentá de nuevo.');
    } catch {
      setError('No se pudo conectar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--ink)] px-6">
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        viewBox="0 0 900 900"
        aria-hidden="true"
      >
        <circle cx="450" cy="450" r="420" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="450" cy="450" r="320" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="450" cy="450" r="220" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="450" cy="450" r="120" fill="none" stroke="white" strokeWidth="1" />
        <line x1="450" y1="30" x2="450" y2="870" stroke="white" strokeWidth="1" />
        <line x1="30" y1="450" x2="870" y2="450" stroke="white" strokeWidth="1" />
      </svg>

      <div className="relative w-full max-w-sm rounded-xl bg-[var(--surface)] p-8 shadow-[0_1px_2px_rgba(21,33,59,.06),0_1px_8px_rgba(21,33,59,.04)]">
        <div className="flex flex-col items-center text-center">
          <RadarMark size={44} />
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
            MEV Radar
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Ingresá con tu usuario y contraseña de MEV.
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label
              htmlFor="usuario"
              className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
            >
              Usuario MEV
            </label>
            <input
              id="usuario"
              autoComplete="username"
              className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="clave"
              className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
            >
              Contraseña MEV
            </label>
            <input
              id="clave"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="deptoRegistrado"
              className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
            >
              Creado en
            </label>
            <select
              id="deptoRegistrado"
              className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
              value={deptoRegistrado}
              onChange={(e) => setDeptoRegistrado(e.target.value)}
            >
              {DEPTOS_REGISTRADOS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading || !usuario || !clave}
            className="w-full rounded-[10px] bg-[var(--seal)] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Validando con MEV…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}
