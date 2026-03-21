const { PrismaClient, UserRole } = require('../generated/prisma-client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@petquotes.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPetQuotes123';
  const clientEmail = process.env.SEED_CLIENT_EMAIL || 'client.demo@petquotes.local';
  const clientPassword = process.env.SEED_CLIENT_PASSWORD || 'PetQuotes123';
  const [adminPasswordHash, clientPasswordHash] = await Promise.all([
    hash(adminPassword, 10),
    hash(clientPassword, 10)
  ]);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
      fullName: 'System Admin'
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      fullName: 'System Admin'
    }
  });

  await prisma.user.upsert({
    where: { email: clientEmail },
    update: {
      id: 'client-demo-001',
      role: UserRole.CLIENT,
      passwordHash: clientPasswordHash,
      fullName: 'Cliente Demo Seed'
    },
    create: {
      id: 'client-demo-001',
      email: clientEmail,
      passwordHash: clientPasswordHash,
      role: UserRole.CLIENT,
      fullName: 'Cliente Demo Seed'
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
