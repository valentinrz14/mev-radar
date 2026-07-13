'use client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--seal)]"
    >
      Salir
    </button>
  );
}
