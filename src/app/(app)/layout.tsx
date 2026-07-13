import Link from 'next/link';
import { getSession } from '@/lib/session';
import { ThemeToggle } from '../ThemeToggle';
import { LogoutButton } from './LogoutButton';
import { RadarMark } from './RadarMark';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isAdmin = session.role === 'admin';

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
          <Link href="/buscar" className="flex items-center gap-2">
            <RadarMark size={26} />
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
              MEV Radar
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-[var(--ink-soft)]">
            <Link href="/buscar" className="transition-colors hover:text-[var(--seal)]">
              Buscar
            </Link>
            <Link href="/historial" className="transition-colors hover:text-[var(--seal)]">
              Historial
            </Link>
            {isAdmin && (
              <Link href="/admin" className="transition-colors hover:text-[var(--seal)]">
                Panel
              </Link>
            )}
            <LogoutButton />
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[900px] px-6 py-10">{children}</main>
    </div>
  );
}
