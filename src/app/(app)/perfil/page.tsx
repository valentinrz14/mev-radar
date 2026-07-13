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
    <main className="max-w-md mx-auto mt-12 p-6">
      <h1 className="text-xl font-bold mb-4">Mis credenciales MEV</h1>
      <form onSubmit={save} className="space-y-3">
        <input
          className="border w-full p-2 rounded"
          placeholder="Usuario MEV"
          value={mevUsuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <input
          className="border w-full p-2 rounded"
          type="password"
          placeholder="Contraseña MEV"
          value={mevClave}
          onChange={(e) => setClave(e.target.value)}
        />
        <input
          className="border w-full p-2 rounded"
          placeholder="Creado en (ej. MO)"
          value={mevDeptoRegistrado}
          onChange={(e) => setDepto(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded">
          Guardar
        </button>
        {saved && <p className="text-green-600 text-sm">Guardado.</p>}
      </form>
    </main>
  );
}
