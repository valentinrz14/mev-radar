'use client';
import { useState } from 'react';
import { notifyDone, requestNotifyPermission } from './notify';
import { useSearchStream } from './useSearchStream';

export default function BuscarPage() {
  const [termino, setTermino] = useState('');
  const [departamento, setDepartamento] = useState('19');
  const { running, progress, matches, discarded, start } = useSearchStream(() =>
    notifyDone(matches.length),
  );

  const searched = progress !== null;
  const percent = progress && progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div>
      <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Barrido de organismos
      </p>
      <h1 className="mt-1 text-[2rem] font-semibold text-[var(--ink)]">Buscar causa</h1>

      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          requestNotifyPermission();
          start(departamento, termino, 'Am');
        }}
      >
        <select
          className="rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
        >
          <option value="19">Morón</option>
        </select>
        <input
          className="flex-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]"
          placeholder="Apellido (carátula)"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-[10px] bg-[var(--seal)] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={running || !termino}
        >
          Buscar
        </button>
      </form>

      {running && (
        <div className="mt-10 flex flex-col items-center">
          <RadarLoader
            count={matches.length}
            current={progress?.current ?? 0}
            total={progress?.total ?? 0}
          />
          <div className="mt-5 w-full max-w-xs text-center">
            <p className="text-sm text-[var(--ink-soft)]">
              {progress
                ? `Organismo ${progress.current} de ${progress.total} — ${progress.label}`
                : 'Iniciando barrido…'}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--signal-soft)]">
              <div
                className="h-full rounded-full bg-[var(--signal)] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {searched && (
        <div className="mt-10">
          <p className="mb-4 text-sm text-[var(--ink-soft)]">
            {matches.length} coincidencia{matches.length === 1 ? '' : 's'}
            {discarded > 0 &&
              ` · ${discarded} descartada${discarded === 1 ? '' : 's'} por no ser palabra exacta`}
          </p>

          {!running && matches.length === 0 ? (
            <div className="rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--ink-soft)]">
              No aparecieron causas con ese apellido exacto en{' '}
              {progress?.label ?? 'el departamento'}. Probá una variante de la escritura.
            </div>
          ) : (
            <ul className="flex list-none flex-col gap-3">
              {matches.map((m) => (
                <li key={`${m.organismoName}-${m.nidCausa}-${m.pidJuzgado}`}>
                  <MatchCard match={m} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
}: {
  match: {
    caratula: string;
    organismoName: string;
    nroExpediente: string;
    estado: string;
    fechaInicio: string;
    nidCausa: string;
    pidJuzgado: string;
  };
}) {
  return (
    <div className="rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_1px_2px_rgba(21,33,59,.06),0_1px_8px_rgba(21,33,59,.04)] transition-shadow hover:border-[var(--signal)] hover:shadow-[0_2px_6px_rgba(21,33,59,.1),0_2px_12px_rgba(21,33,59,.06)]">
      <a
        className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--seal)] hover:underline"
        target="_blank"
        rel="noreferrer"
        href={`https://mev.scba.gov.ar/procesales.asp?nidCausa=${match.nidCausa}&pidJuzgado=${match.pidJuzgado}`}
      >
        {match.caratula}
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
        <span className="text-[var(--ink-soft)]">{match.organismoName}</span>
        <span aria-hidden="true" className="text-[var(--line)]">
          ·
        </span>
        <span className="rounded-full bg-[var(--seal-ink)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[var(--seal)]">
          Expte {match.nroExpediente}
        </span>
        <span aria-hidden="true" className="text-[var(--line)]">
          ·
        </span>
        <span className="rounded-full bg-[var(--signal-soft)] px-2 py-0.5 text-[var(--ink)]">
          {match.estado}
        </span>
        <span aria-hidden="true" className="text-[var(--line)]">
          ·
        </span>
        <span className="text-[var(--ink-soft)]">inicio {match.fechaInicio}</span>
      </div>
    </div>
  );
}

function RadarLoader({ count, current, total }: { count: number; current: number; total: number }) {
  return (
    <div className="relative h-[220px] w-[220px]">
      <svg viewBox="0 0 220 220" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="110" cy="110" r="105" fill="var(--surface)" />
        <circle cx="110" cy="110" r="100" fill="none" stroke="var(--line)" strokeWidth="1" />
        <circle cx="110" cy="110" r="75" fill="none" stroke="var(--line)" strokeWidth="1" />
        <circle cx="110" cy="110" r="50" fill="none" stroke="var(--line)" strokeWidth="1" />
        <circle cx="110" cy="110" r="25" fill="none" stroke="var(--line)" strokeWidth="1" />
        <line
          x1="110"
          y1="10"
          x2="110"
          y2="210"
          stroke="var(--line)"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="10"
          y1="110"
          x2="210"
          y2="110"
          stroke="var(--line)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      <div
        className="radar-sweep absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(31,168,160,0.4), rgba(31,168,160,0) 32%, rgba(31,168,160,0) 100%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--ink)]">
          {count}
        </span>
        <span className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]">
          organismo {current} / {total || '—'}
        </span>
      </div>
    </div>
  );
}
