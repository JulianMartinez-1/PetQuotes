import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(async (value: string) => `hashed:${value}`),
  compare: jest.fn(async (plain: string, hashed: string) => hashed === `hashed:${plain}`)
}));

describe("AuthService", () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    refreshSession: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    }
  } as any;

  const jwt = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn()
  } as any;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma, jwt);
    jwt.signAsync.mockResolvedValueOnce("access-token").mockResolvedValueOnce("refresh-token");
    jwt.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
  });

  it("register creates client role even if payload includes role", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: "u1", email: "user@mail.com", role: "CLIENT" });

    const result = await service.register({
      email: "user@mail.com",
      password: "password123",
      fullName: "User Name",
      role: "ADMIN"
    } as any);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "CLIENT" })
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        role: "CLIENT"
      })
    );
  });

  it("register throws when email already exists", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1" });

    await expect(
      service.register({
        email: "user@mail.com",
        password: "password123",
        fullName: "User Name"
      } as any)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("login resets failed attempts on valid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@mail.com",
      role: "CLIENT",
      passwordHash: "hashed:password123",
      failedLoginAttempts: 2,
      lockedUntil: null
    });

    await service.login({ email: "user@mail.com", password: "password123" });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ failedLoginAttempts: 0, lockedUntil: null })
      })
    );
  });

  it("login throws unauthorized on invalid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@mail.com",
      role: "CLIENT",
      passwordHash: "hashed:other",
      failedLoginAttempts: 0,
      lockedUntil: null
    });

    await expect(service.login({ email: "user@mail.com", password: "password123" })).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
