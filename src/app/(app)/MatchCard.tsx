'use client';
import type { FavMatch } from './useFavorites';

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill={filled ? '#e0a82e' : 'none'}
      stroke={filled ? '#e0a82e' : 'currentColor'}
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95z" />
    </svg>
  );
}

export function MatchCard({
  match,
  favorited,
  onToggle,
}: {
  match: FavMatch;
  favorited: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_1px_2px_rgba(21,33,59,.06),0_1px_8px_rgba(21,33,59,.04)] transition-shadow hover:border-[var(--signal)] hover:shadow-[0_2px_6px_rgba(21,33,59,.1),0_2px_12px_rgba(21,33,59,.06)]">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={favorited}
        aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        title={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className="absolute right-2.5 top-2.5 rounded-md p-1 text-[var(--ink-soft)] transition-colors hover:bg-[var(--signal-soft)] hover:text-[var(--ink)]"
      >
        <StarIcon filled={favorited} />
      </button>
      <a
        className="block pr-9 font-[family-name:var(--font-display)] text-base font-semibold text-[var(--seal)] hover:underline"
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
