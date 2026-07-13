'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RadarMark } from '../(app)/RadarMark';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const { role } = await res.json();
      router.push(role === 'admin' ? '/admin' : '/buscar');
    } else {
      setError('Email o contraseña incorrectos');
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
            Ubicá causas en todos los juzgados, sin ir juzgado por juzgado.
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
              className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-[10px] bg-[var(--seal)] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}
