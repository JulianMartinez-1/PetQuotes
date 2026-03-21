import { ForbiddenException, Injectable, NotFoundException, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import * as amqp from "amqplib";
import { Channel, ChannelModel } from "amqplib";
import { PrismaService } from "../prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { AuthUser } from "../auth-context";
import { metricsStore } from "../metrics.store";

type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "RESCHEDULED";

@Injectable()
export class AppointmentsService implements OnModuleDestroy {
  private static readonly SERVICE_NAME = "appointment-service";
  private readonly redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
  private rabbitConnection?: ChannelModel;
  private rabbitChannel?: Channel;

  constructor(private readonly prisma: PrismaService) {
    void this.setupRabbit();
  }

  async create(dto: CreateAppointmentDto, actor: AuthUser, idempotencyKey?: string) {
    if (actor.role === "CLIENT" && dto.clientId !== actor.sub) {
      throw new ForbiddenException("Un cliente solo puede crear citas para su propio usuario");
    }

    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet) {
      throw new NotFoundException("Mascota no encontrada");
    }

    if (pet.ownerId !== dto.clientId) {
      throw new ForbiddenException("La mascota no pertenece al cliente indicado");
    }

    if (idempotencyKey) {
      const existing = await this.prisma.appointment.findUnique({ where: { idempotencyKey } });
      if (existing) {
        if (actor.role === "CLIENT" && existing.clientId !== actor.sub) {
          throw new ForbiddenException("La clave de idempotencia pertenece a otro usuario");
        }
        metricsStore.incrementBusinessMetric(AppointmentsService.SERVICE_NAME, "booking_idempotent_replay", {
          role: actor.role
        });
        return existing;
      }
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: dto.clientId,
        petId: dto.petId,
        veterinarianId: dto.veterinarianId,
        serviceId: dto.serviceId,
        branchId: dto.branchId,
        idempotencyKey,
        startsAt: new Date(dto.startsAt),
        notes: dto.notes
      }
    });

    await this.invalidatePetCache(dto.petId);
    await this.publishEvent("appointment.created", appointment);
    metricsStore.incrementBusinessMetric(AppointmentsService.SERVICE_NAME, "booking_created", {
      role: actor.role,
      branchId: dto.branchId,
      serviceId: dto.serviceId
    });

    return appointment;
  }

  async findByPet(petId: string, actor: AuthUser) {
    const cacheKey = `appointments:pet:${petId}:role:${actor.role}:user:${actor.sub}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      metricsStore.incrementBusinessMetric(AppointmentsService.SERVICE_NAME, "booking_list_cache_hit", {
        role: actor.role
      });
      return JSON.parse(cached);
    }

    metricsStore.incrementBusinessMetric(AppointmentsService.SERVICE_NAME, "booking_list_cache_miss", {
      role: actor.role
    });

    const where = actor.role === "CLIENT" ? { petId, clientId: actor.sub } : { petId };

    const appointments = await this.prisma.appointment.findMany({
      where,
      orderBy: { startsAt: "desc" }
    });

    await this.redis.set(cacheKey, JSON.stringify(appointments), "EX", 60);
    return appointments;
  }

  async updateStatus(id: string, status: AppointmentStatus, actor: AuthUser) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException("Cita no encontrada");
    }

    if (actor.role === "VETERINARY" && appointment.veterinarianId !== actor.sub) {
      throw new ForbiddenException("Solo puedes gestionar tus propias citas veterinarias");
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status }
    });

    await this.invalidatePetCache(updated.petId);
    await this.publishEvent("appointment.status.updated", updated);
    metricsStore.incrementBusinessMetric(AppointmentsService.SERVICE_NAME, "booking_status_updated", {
      role: actor.role,
      status
    });

    return updated;
  }

  async reschedule(id: string, startsAt: string, actor: AuthUser) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException("Cita no encontrada");
    }

    if (actor.role === "VETERINARY" && appointment.veterinarianId !== actor.sub) {
      throw new ForbiddenException("Solo puedes reprogramar tus propias citas veterinarias");
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        startsAt: new Date(startsAt),
        status: "RESCHEDULED"
      }
    });

    await this.invalidatePetCache(updated.petId);
    await this.publishEvent("appointment.rescheduled", updated);
    metricsStore.incrementBusinessMetric(AppointmentsService.SERVICE_NAME, "booking_rescheduled", {
      role: actor.role
    });

    return updated;
  }

  async onModuleDestroy() {
    await this.redis.quit();
    await this.rabbitChannel?.close();
    await this.rabbitConnection?.close();
  }

  private async setupRabbit() {
    try {
      this.rabbitConnection = await amqp.connect(process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672");
      this.rabbitChannel = await this.rabbitConnection.createChannel();
      await this.rabbitChannel.assertExchange("petquotes.events", "topic", { durable: true });
    } catch (error) {
      console.warn("RabbitMQ no disponible. Se continuará sin eventos.", error);
    }
  }

  private async publishEvent(routingKey: string, payload: unknown) {
    if (!this.rabbitChannel) {
      return;
    }

    this.rabbitChannel.publish("petquotes.events", routingKey, Buffer.from(JSON.stringify(payload)));
  }

  private async invalidatePetCache(petId: string) {
    const pattern = `appointments:pet:${petId}:*`;
    let cursor = "0";

    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== "0");
  }
}
