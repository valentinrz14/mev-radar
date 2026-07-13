'use client';
import { useCallback, useEffect, useState } from 'react';
import { RadarMark } from '../(app)/RadarMark';

type Row = {
  id: string;
  nombre: string;
  email: string;
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
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

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
    try {
      await act({ action: 'create', nombre, email, password });
      setNombre('');
      setEmail('');
      setPassword('');
    } finally {
      setCreating(false);
    }
  }

  function resetPassword(userId: string) {
    const password = window.prompt('Nueva contraseña para este abogado:');
    if (!password) return;
    act({ action: 'reset', userId, password });
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[900px] items-center gap-2 px-6 py-3">
          <RadarMark size={26} />
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
            MEV Radar
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-6 py-10">
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
          <form onSubmit={createLawyer} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="rounded-[10px] bg-[var(--seal)] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              disabled={creating}
            >
              Crear abogado
            </button>
          </form>
        </section>

        <div className="mt-8 overflow-x-auto rounded-[10px] border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                <th className="px-4 py-3">Abogado</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Días restantes</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 text-[var(--ink)]">{u.nombre}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyle[u.badge]}`}
                    >
                      {u.daysRemaining} días
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">
                    {u.status === 'active' ? 'Activo' : 'Inactivo'}
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
                      <button
                        type="button"
                        className="text-[var(--seal)] hover:underline"
                        onClick={() => resetPassword(u.id)}
                      >
                        Restablecer contraseña
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
