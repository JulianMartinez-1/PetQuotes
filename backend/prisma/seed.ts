import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  try {
    // Credenciales del admin
    const adminEmail = 'admin@petquotes.local';
    const adminPassword = 'Admin@123456';
    const adminFullName = 'Administrador';

    // Verificar si el admin ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ El usuario admin ya existe en la base de datos.');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`🔐 Rol: ${existingAdmin.role}\n`);
    } else {
      // Hashear la contraseña
      const passwordHash = await bcryptjs.hash(adminPassword, 10);

      // Crear el usuario admin
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          fullName: adminFullName,
          role: 'ADMIN',
          emailVerified: true,
        },
      });

      console.log('✨ Usuario admin creado exitosamente!\n');
    }

    // Obtener el admin para usarlo como owner de las clínicas
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Seed de clínicas
    const clinicsData = [
      {
        name: 'Vet Prime',
        city: 'Bogota',
        neighborhood: 'Chapinero',
        latitude: 4.7380,
        longitude: -74.0520,
        phone: '+57 (1) 3456 7890',
        email: 'info@vetprime.com',
        description: 'Atencion integral para mascotas con diagnostico rapido y seguimiento digital.',
        image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200&auto=format&fit=crop',
        services: [
          { name: 'Consulta General', price: 80000, duration: 30, category: 'consultation' },
          { name: 'Vacunacion', price: 120000, duration: 20, category: 'vaccination' },
          { name: 'Laboratorio', price: 150000, duration: 45, category: 'consultation' },
        ],
      },
      {
        name: 'Animal Hub',
        city: 'Bogota',
        neighborhood: 'Usaquen',
        latitude: 4.7230,
        longitude: -74.0150,
        phone: '+57 (1) 2345 6789',
        email: 'info@animalhub.com',
        description: 'Equipo clinico con foco en medicina preventiva y bienestar continuo.',
        image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?q=80&w=1200&auto=format&fit=crop',
        services: [
          { name: 'Consulta General', price: 85000, duration: 30, category: 'consultation' },
          { name: 'Grooming', price: 200000, duration: 60, category: 'grooming' },
          { name: 'Urgencias', price: 250000, duration: 60, category: 'consultation' },
        ],
      },
      {
        name: 'PetCare Norte',
        city: 'Bogota',
        neighborhood: 'Suba',
        latitude: 4.7650,
        longitude: -74.0320,
        phone: '+57 (1) 4567 8901',
        email: 'info@petcarenorte.com',
        description: 'Centro especializado en cirugia y traumatologia de mascotas pequeñas.',
        image: 'https://images.unsplash.com/photo-1569457613066-ce10d1a3fe34?q=80&w=1200&auto=format&fit=crop',
        services: [
          { name: 'Cirugias', price: 500000, duration: 120, category: 'surgery' },
          { name: 'Traumatologia', price: 450000, duration: 90, category: 'surgery' },
          { name: 'Radiologia', price: 180000, duration: 30, category: 'consultation' },
        ],
      },
    ];

    for (const clinicData of clinicsData) {
      const existingClinic = await prisma.clinic.findFirst({
        where: { name: clinicData.name },
      });

      if (!existingClinic) {
        // Crear un veterinario para esta clínica
        const vet = await prisma.user.create({
          data: {
            email: `vet-${clinicData.name.toLowerCase().replace(/\s/g, '-')}@petquotes.local`,
            passwordHash: await bcryptjs.hash('Vet@12345', 10),
            fullName: `Dr. ${clinicData.name}`,
            role: 'VETERINARY',
            emailVerified: true,
          },
        });

        const clinic = await prisma.clinic.create({
          data: {
            ownerUserId: admin.id,
            name: clinicData.name,
            phone: clinicData.phone,
            email: clinicData.email,
            description: clinicData.description,
            logo: clinicData.image,
            services: {
              create: clinicData.services.map(svc => ({
                name: svc.name,
                price: svc.price,
                duration: svc.duration,
                category: svc.category,
              })),
            },
            branches: {
              create: [
                {
                  name: `${clinicData.name} - Sede Principal`,
                  city: clinicData.city,
                  address: clinicData.neighborhood,
                  latitude: clinicData.latitude,
                  longitude: clinicData.longitude,
                  phone: clinicData.phone,
                  professionals: {
                    create: [
                      {
                        userId: vet.id,
                        specialty: 'Veterinaria General',
                        licenseNumber: `LIC-${clinicData.name.toUpperCase().replace(/\s/g, '')}-001`,
                        yearsOfExperience: 10,
                      },
                    ],
                  },
                },
              ],
            },
          },
        });
        console.log(`✅ Clínica creada: ${clinic.name} (ID: ${clinic.id})`);
      } else {
        console.log(`⏭️  Clínica ya existe: ${clinicData.name}`);
      }
    }

    console.log('\n🌱 Seed completado!\n');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
