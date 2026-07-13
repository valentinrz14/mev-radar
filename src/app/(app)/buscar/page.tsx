'use client';
import { useState } from 'react';
import { notifyDone } from './notify';
import { useSearchStream } from './useSearchStream';

export default function BuscarPage() {
  const [termino, setTermino] = useState('');
  const [departamento, setDepartamento] = useState('19');
  const { running, progress, matches, discarded, start } = useSearchStream(() =>
    notifyDone(matches.length),
  );

  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Buscar causa</h1>
      <form
        className="flex gap-2 mb-6"
        onSubmit={(e) => {
          e.preventDefault();
          start(departamento, termino, 'Am');
        }}
      >
        <select
          className="border p-2 rounded"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
        >
          <option value="19">Morón</option>
        </select>
        <input
          className="border p-2 rounded flex-1"
          placeholder="Apellido (carátula)"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
          disabled={running || !termino}
        >
          Buscar
        </button>
      </form>

      {running && progress && (
        <div className="mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Organismo {progress.current} de {progress.total} — {progress.label}
          </div>
          <div className="w-full bg-gray-200 rounded h-2 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-2">
        {matches.length} coincidencia(s)
        {discarded > 0 && ` · ${discarded} descartada(s) por no ser palabra exacta`}
      </p>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li
            key={`${m.organismoName}-${m.nidCausa}-${m.pidJuzgado}`}
            className="border rounded p-3"
          >
            <a
              className="font-medium text-blue-700 hover:underline"
              target="_blank"
              rel="noreferrer"
              href={`https://mev.scba.gov.ar/procesales.asp?nidCausa=${m.nidCausa}&pidJuzgado=${m.pidJuzgado}`}
            >
              {m.caratula}
            </a>
            <div className="text-xs text-gray-500 mt-1">
              {m.organismoName} · Expte {m.nroExpediente} · {m.estado} · inicio {m.fechaInicio}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
