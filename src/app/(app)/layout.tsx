import Link from 'next/link';
import { getSession } from '@/lib/session';
import { LogoutButton } from './LogoutButton';
import { RadarMark } from './RadarMark';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isAdmin = session.role === 'admin';

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
          <Link href="/buscar" className="flex items-center gap-2">
            <RadarMark size={26} />
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
              MEV Radar
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-[var(--ink-soft)]">
            <Link href="/buscar" className="transition-colors hover:text-[var(--seal)]">
              Buscar
            </Link>
            <Link href="/historial" className="transition-colors hover:text-[var(--seal)]">
              Historial
            </Link>
            <Link href="/perfil" className="transition-colors hover:text-[var(--seal)]">
              Perfil
            </Link>
            {isAdmin && (
              <Link href="/admin" className="transition-colors hover:text-[var(--seal)]">
                Panel
              </Link>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[900px] px-6 py-10">{children}</main>
    </div>
  );
}
