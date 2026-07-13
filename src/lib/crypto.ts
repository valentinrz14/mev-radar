import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function key(): Buffer {
  const hex = process.env.MEV_CRED_KEY;
  if (hex?.length !== 64) throw new Error('MEV_CRED_KEY debe ser 64 chars hex (32 bytes)');
  return Buffer.from(hex, 'hex');
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), tag.toString('hex'), ct.toString('hex')].join(':');
}

export function decryptSecret(token: string): string {
  const [ivHex, tagHex, ctHex] = token.split(':');
  if (!ivHex || !tagHex || !ctHex) throw new Error('token inválido');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(ctHex, 'hex')), decipher.final()]).toString(
    'utf8',
  );
}
