import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const [email, password, nombre] = process.argv.slice(2);
if (!email || !password) {
  console.error('uso: bun scripts/seed-admin.ts <email> <password> [nombre]');
  process.exit(1);
}
const passwordHash = await bcrypt.hash(password, 10);
await prisma.user.upsert({
  where: { email },
  update: { role: 'admin' },
  create: {
    email,
    passwordHash,
    nombre: nombre ?? 'Admin',
    role: 'admin',
    subscription: { create: { expiresAt: new Date(Date.now() + 3650 * 86_400_000) } },
  },
});
console.log('Admin creado:', email);
await prisma.$disconnect();
