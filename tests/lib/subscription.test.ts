import { describe, expect, it } from 'vitest';
import { daysRemaining, subscriptionBadge } from '@/lib/subscription';

describe('daysRemaining', () => {
  const now = new Date('2026-07-13T12:00:00Z');
  it('cuenta días hacia el futuro', () => {
    expect(daysRemaining(new Date('2026-07-23T12:00:00Z'), now)).toBe(10);
  });
  it('devuelve 0 si ya venció', () => {
    expect(daysRemaining(new Date('2026-07-01T12:00:00Z'), now)).toBe(0);
  });
});

describe('subscriptionBadge', () => {
  it('mapea a colores', () => {
    expect(subscriptionBadge(10)).toBe('green');
    expect(subscriptionBadge(5)).toBe('yellow');
    expect(subscriptionBadge(0)).toBe('red');
  });
});
