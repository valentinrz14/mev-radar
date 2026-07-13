'use client';
import { useCallback, useEffect, useState } from 'react';

type Row = {
  id: string;
  nombre: string;
  email: string;
  daysRemaining: number;
  badge: 'green' | 'yellow' | 'red';
  status: string;
};
const color = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
};

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
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
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Abogado</th>
            <th>Email</th>
            <th>Días restantes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.nombre}</td>
              <td>{u.email}</td>
              <td>
                <span className={`px-2 py-1 rounded ${color[u.badge]}`}>
                  {u.daysRemaining} días
                </span>
              </td>
              <td className="space-x-2">
                <button
                  type="button"
                  className="text-blue-600"
                  onClick={() => act({ action: 'renew', userId: u.id })}
                >
                  +30 días
                </button>
                <button
                  type="button"
                  className="text-gray-600"
                  onClick={() => act({ action: 'toggle', userId: u.id })}
                >
                  {u.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
