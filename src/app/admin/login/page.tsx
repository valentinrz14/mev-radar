'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RadarMark } from '../../(app)/RadarMark';
import { ThemeToggle } from '../../ThemeToggle';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/admin');
        return;
      }
      setError('Email o contraseña incorrectos');
    } catch {
      setError('No se pudo conectar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d1424] px-6">
      <div className="absolute right-4 top-4 z-10 text-white/70">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-sm rounded-xl bg-[var(--surface)] p-8 shadow-[0_1px_2px_rgba(21,33,59,.06),0_1px_8px_rgba(21,33,59,.04)]">
        <div className="flex flex-col items-center text-center">
          <RadarMark size={44} />
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
            MEV Radar — Admin
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Panel de administración del estudio.
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-[10px] bg-[var(--seal)] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}
