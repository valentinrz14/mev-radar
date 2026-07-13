import { describe, it, expect, beforeAll } from 'vitest';
import { encryptSecret, decryptSecret } from '@/lib/crypto';

beforeAll(() => {
  process.env.MEV_CRED_KEY = '0'.repeat(64); // 32 bytes en hex
});

describe('crypto', () => {
  it('round-trips a secret', () => {
    const plain = 'rfP#9xZpdTw&@vGN*7Gx';
    const token = encryptSecret(plain);
    expect(token).not.toContain(plain);
    expect(decryptSecret(token)).toBe(plain);
  });

  it('produces different ciphertext each call (random IV)', () => {
    expect(encryptSecret('hola')).not.toBe(encryptSecret('hola'));
  });

  it('throws on tampered token', () => {
    const token = encryptSecret('hola');
    const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'b' : 'a');
    expect(() => decryptSecret(tampered)).toThrow();
  });
});
