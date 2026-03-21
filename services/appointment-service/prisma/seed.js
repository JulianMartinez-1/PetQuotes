const { PrismaClient, AppointmentStatus } = require('../generated/prisma-client');

const prisma = new PrismaClient();

async function main() {
  const pet = await prisma.pet.upsert({
    where: { id: 'pet-demo-001' },
    update: { ownerId: 'client-demo-001', name: 'Milo', species: 'Dog' },
    create: {
      id: 'pet-demo-001',
      ownerId: 'client-demo-001',
      name: 'Milo',
      species: 'Dog'
    }
  });

  await prisma.pet.upsert({
    where: { id: 'pet-demo-002' },
    update: { ownerId: 'client-demo-001', name: 'Nala', species: 'Cat' },
    create: {
      id: 'pet-demo-002',
      ownerId: 'client-demo-001',
      name: 'Nala',
      species: 'Cat'
    }
  });

  await prisma.appointment.upsert({
    where: { id: 'appt-demo-001' },
    update: {},
    create: {
      id: 'appt-demo-001',
      clientId: 'client-demo-001',
      petId: pet.id,
      veterinarianId: 'vet-demo-001',
      serviceId: 'service-consulta',
      branchId: 'branch-norte',
      status: AppointmentStatus.PENDING,
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes: 'Initial seeded appointment'
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
