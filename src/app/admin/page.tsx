'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { RadarMark } from '../(app)/RadarMark';
import { ThemeToggle } from '../ThemeToggle';

type Row = {
  id: string;
  nombre: string;
  email: string | null;
  mevUsuario: string | null;
  activado: boolean;
  daysRemaining: number;
  badge: 'green' | 'yellow' | 'red';
  status: string;
};

const badgeStyle: Record<Row['badge'], string> = {
  green: 'bg-[var(--ok)]/10 text-[var(--ok)]',
  yellow: 'bg-[var(--amber)]/10 text-[var(--amber)]',
  red: 'bg-[var(--danger)]/10 text-[var(--danger)]',
};

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [mevUsuario, setMevUsuario] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  const load = useCallback(async () => {
    setRows(await fetch('/api/admin/users').then((r) => r.json()));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function act(body: object) {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    load();
  }

  async function createLawyer(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'create', mevUsuario, email, nombre }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'No se pudo crear el abogado.');
        return;
      }
      setMevUsuario('');
      setEmail('');
      setNombre('');
      load();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <RadarMark size={26} />
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
              MEV Radar
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-6 py-10">
        <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
          Administración
        </p>
        <h1 className="mt-1 text-[2rem] font-semibold text-[var(--ink)]">
          Panel de administración
        </h1>

        <section className="mt-8 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
            Alta de abogado
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            El abogado activa su acceso la primera vez que ingresa con su contraseña de MEV.
          </p>
          <form onSubmit={createLawyer} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              placeholder="Usuario MEV"
              value={mevUsuario}
              onChange={(e) => setMevUsuario(e.target.value)}
              required
            />
            <input
              className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              placeholder="Email (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-[10px] bg-[var(--seal)] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              disabled={creating}
            >
              Crear abogado
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        </section>

        <div className="mt-8 overflow-x-auto rounded-[10px] border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                <th className="px-4 py-3">Abogado</th>
                <th className="px-4 py-3">Usuario MEV</th>
                <th className="px-4 py-3">Acceso</th>
                <th className="px-4 py-3">Días restantes</th>
                <th className="px-4 py-3">Suscripción</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3">
                    <span className="text-[var(--ink)]">{u.nombre}</span>
                    {u.email && (
                      <span className="block text-xs text-[var(--ink-soft)]">{u.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-[var(--ink)]">
                    {u.mevUsuario}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.activado
                          ? 'bg-[var(--ok)]/10 text-[var(--ok)]'
                          : 'bg-[var(--amber)]/10 text-[var(--amber)]'
                      }`}
                    >
                      {u.activado ? 'Activado' : 'Pendiente 1er ingreso'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyle[u.badge]}`}
                    >
                      {u.daysRemaining} días
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">
                    {u.status === 'active' ? 'Activa' : 'Inactiva'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 text-xs font-medium">
                      <button
                        type="button"
                        className="text-[var(--signal)] hover:underline"
                        onClick={() => act({ action: 'renew', userId: u.id })}
                      >
                        Renovar 30 días
                      </button>
                      <button
                        type="button"
                        className="text-[var(--ink-soft)] hover:underline"
                        onClick={() => act({ action: 'toggle', userId: u.id })}
                      >
                        {u.status === 'active' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
