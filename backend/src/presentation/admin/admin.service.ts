import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { NotificationService } from '@business/notifications/notification.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getVeterinaryRequests(status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING') {
    return this.prisma.veterinaryProfile.findMany({
      where: { status },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, createdAt: true },
        },
        clinic: {
          include: {
            branches: {
              select: { city: true, address: true, latitude: true, longitude: true, phone: true },
            },
            services: {
              select: { name: true, category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveVeterinaryRequest(id: string) {
    const profile = await this.prisma.veterinaryProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        clinic: { select: { id: true, name: true } },
      },
    });

    if (!profile) throw new NotFoundException('Solicitud no encontrada');
    if (profile.status !== 'PENDING') {
      throw new BadRequestException('La solicitud ya fue procesada');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.veterinaryProfile.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      if (profile.veterinaryType === 'CLINIC' && profile.clinicId) {
        await tx.clinic.update({
          where: { id: profile.clinicId },
          data: { isVerified: true },
        });
      }

      await tx.notification.create({
        data: {
          userId: profile.userId,
          type: 'SYSTEM_ALERT',
          title: '✅ Tu solicitud fue aprobada',
          message:
            profile.veterinaryType === 'CLINIC'
              ? `¡Felicidades! Tu clínica "${profile.clinic?.name ?? ''}" ya es visible en PetQuotes.`
              : '¡Felicidades! Tu perfil de veterinario independiente ya está activo en PetQuotes.',
        },
      });
    });

    return { success: true, message: 'Solicitud aprobada' };
  }

  async rejectVeterinaryRequest(id: string, reason: string) {
    const profile = await this.prisma.veterinaryProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        clinic: { select: { name: true } },
      },
    });

    if (!profile) throw new NotFoundException('Solicitud no encontrada');
    if (profile.status !== 'PENDING') {
      throw new BadRequestException('La solicitud ya fue procesada');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.veterinaryProfile.update({
        where: { id },
        data: { status: 'REJECTED', rejectionReason: reason },
      });

      await tx.notification.create({
        data: {
          userId: profile.userId,
          type: 'SYSTEM_ALERT',
          title: 'Actualización sobre tu solicitud',
          message: `Tu solicitud fue revisada. Motivo: ${reason}`,
        },
      });
    });

    // Send rejection email (fire-and-forget)
    this.notificationService
      .sendVeterinaryRejection({
        to: profile.user.email,
        applicantName: profile.user.fullName,
        veterinaryType: profile.veterinaryType as 'CLINIC' | 'INDEPENDENT',
        clinicName: profile.clinic?.name,
        reason,
      })
      .catch(() => {});

    return { success: true, message: 'Solicitud rechazada' };
  }
}
