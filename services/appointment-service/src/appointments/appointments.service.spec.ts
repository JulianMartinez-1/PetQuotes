import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";

const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  scan: jest.fn(),
  quit: jest.fn()
};

jest.mock("ioredis", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => redisMock)
  };
});

jest.mock("amqplib", () => ({
  connect: jest.fn().mockRejectedValue(new Error("rabbit-off"))
}));

describe("AppointmentsService", () => {
  const prisma = {
    pet: {
      findUnique: jest.fn()
    },
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  } as any;

  let service: AppointmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppointmentsService(prisma);
    prisma.pet.findUnique.mockResolvedValue({ id: "pet1", ownerId: "u1" });
    redisMock.scan.mockResolvedValue(["0", []]);
    redisMock.del.mockResolvedValue(1);
  });

  it("blocks client creating appointment for another user", async () => {
    await expect(
      service.create(
        {
          clientId: "another-user",
          petId: "pet1",
          veterinarianId: "vet1",
          serviceId: "svc1",
          branchId: "br1",
          startsAt: new Date().toISOString()
        },
        { sub: "u1", email: "u@mail.com", role: "CLIENT" }
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns cached appointments when available", async () => {
    redisMock.get.mockResolvedValue(JSON.stringify([{ id: "a1" }]));

    const result = await service.findByPet("pet1", { sub: "u1", email: "u@mail.com", role: "CLIENT" });

    expect(result).toEqual([{ id: "a1" }]);
    expect(prisma.appointment.findMany).not.toHaveBeenCalled();
  });

  it("blocks create when pet does not belong to client", async () => {
    prisma.pet.findUnique.mockResolvedValue({ id: "pet1", ownerId: "owner-2" });

    await expect(
      service.create(
        {
          clientId: "u1",
          petId: "pet1",
          veterinarianId: "vet1",
          serviceId: "svc1",
          branchId: "br1",
          startsAt: new Date().toISOString()
        },
        { sub: "u1", email: "u@mail.com", role: "CLIENT" }
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("invalidates all pet cache keys after update status", async () => {
    prisma.appointment.findUnique.mockResolvedValue({ id: "a1", petId: "pet1", veterinarianId: "vet1" });
    prisma.appointment.update.mockResolvedValue({ id: "a1", petId: "pet1" });
    redisMock.scan
      .mockResolvedValueOnce(["1", ["appointments:pet:pet1:role:CLIENT:user:u1"]])
      .mockResolvedValueOnce(["0", ["appointments:pet:pet1:role:ADMIN:user:admin"]]);

    await service.updateStatus("a1", "CONFIRMED", { sub: "admin", email: "a@mail.com", role: "ADMIN" });

    expect(redisMock.del).toHaveBeenCalledWith("appointments:pet:pet1:role:CLIENT:user:u1");
    expect(redisMock.del).toHaveBeenCalledWith("appointments:pet:pet1:role:ADMIN:user:admin");
  });

  it("throws not found when rescheduling unknown appointment", async () => {
    prisma.appointment.findUnique.mockResolvedValue(null);

    await expect(
      service.reschedule("missing", new Date().toISOString(), { sub: "admin", email: "a@mail.com", role: "ADMIN" })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
