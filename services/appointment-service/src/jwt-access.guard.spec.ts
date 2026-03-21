import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAccessGuard } from "./jwt-access.guard";

describe("JwtAccessGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "test-secret";
  });

  it("throws when authorization header is missing", async () => {
    const guard = new JwtAccessGuard();
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) })
    } as any;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("attaches user to request on valid token", async () => {
    jest.spyOn(JwtService.prototype, "verifyAsync").mockResolvedValue({
      sub: "u1",
      email: "u@mail.com",
      role: "CLIENT"
    } as any);

    const guard = new JwtAccessGuard();
    const request: any = { headers: { authorization: "Bearer token" } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request })
    } as any;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ sub: "u1", email: "u@mail.com", role: "CLIENT" });
  });
});
