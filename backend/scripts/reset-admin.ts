import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@petquotes.local';
  const password = 'Admin@123456';

  const passwordHash = await bcryptjs.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      emailVerified: true,
      role: 'ADMIN',
    },
    create: {
      email,
      passwordHash,
      fullName: 'Administrador',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log(`✅ Admin listo: ${admin.email} (ID: ${admin.id})`);
  console.log(`   Email:      ${email}`);
  console.log(`   Contraseña: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
