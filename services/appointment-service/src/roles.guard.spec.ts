import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  const reflector = {
    getAllAndOverride: jest.fn()
  } as unknown as Reflector;

  const makeContext = (role?: "CLIENT" | "VETERINARY" | "ADMIN") =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { role } : undefined })
      })
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows request when no roles required", () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(makeContext("CLIENT"))).toBe(true);
  });

  it("blocks request when role is not allowed", () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(["ADMIN"]);
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(makeContext("CLIENT"))).toThrow(ForbiddenException);
  });
});
