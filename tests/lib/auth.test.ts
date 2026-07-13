import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth';

describe('password hashing', () => {
  it('verifica el password correcto y rechaza el incorrecto', async () => {
    const h = await hashPassword('secreto123');
    expect(h).not.toBe('secreto123');
    expect(await verifyPassword('secreto123', h)).toBe(true);
    expect(await verifyPassword('otro', h)).toBe(false);
  });
});
