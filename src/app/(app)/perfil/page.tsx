'use client';
import { useEffect, useState } from 'react';

export default function PerfilPage() {
  const [mevUsuario, setUsuario] = useState('');
  const [mevClave, setClave] = useState('');
  const [mevDeptoRegistrado, setDepto] = useState('MO');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch('/api/mev-credentials')
      .then((r) => r.json())
      .then((c) => {
        if (c) {
          setUsuario(c.mevUsuario);
          setDepto(c.mevDeptoRegistrado);
        }
      });
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch('/api/mev-credentials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mevUsuario, mevClave, mevDeptoRegistrado }),
    });
    setSaved(res.ok);
  }
  return (
    <div className="mx-auto max-w-md">
      <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Cuenta
      </p>
      <h1 className="mt-1 text-[2rem] font-semibold text-[var(--ink)]">Mis credenciales MEV</h1>

      <form
        onSubmit={save}
        className="mt-6 space-y-4 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_1px_2px_rgba(21,33,59,.06),0_1px_8px_rgba(21,33,59,.04)]"
      >
        <div>
          <label
            htmlFor="mevUsuario"
            className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
          >
            Usuario MEV
          </label>
          <input
            id="mevUsuario"
            className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
            value={mevUsuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="mevClave"
            className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
          >
            Contraseña MEV
          </label>
          <input
            id="mevClave"
            className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
            type="password"
            value={mevClave}
            onChange={(e) => setClave(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="mevDeptoRegistrado"
            className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]"
          >
            Creado en (ej. MO)
          </label>
          <input
            id="mevDeptoRegistrado"
            className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
            value={mevDeptoRegistrado}
            onChange={(e) => setDepto(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-[10px] bg-[var(--seal)] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Guardar
        </button>
        {saved && <p className="text-sm text-[var(--ok)]">Guardado.</p>}
      </form>
    </div>
  );
}
