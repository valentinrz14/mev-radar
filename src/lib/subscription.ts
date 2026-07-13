import { prisma } from './prisma';

export function daysRemaining(expiresAt: Date, now: Date = new Date()): number {
  const ms = expiresAt.getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
}
export function subscriptionBadge(days: number): 'green' | 'yellow' | 'red' {
  if (days > 7) return 'green';
  if (days >= 1) return 'yellow';
  return 'red';
}
export async function isActive(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (sub?.status !== 'active') return false;
  return daysRemaining(sub.expiresAt) > 0;
}
