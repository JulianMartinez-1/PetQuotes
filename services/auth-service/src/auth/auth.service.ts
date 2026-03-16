import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private readonly maxLoginAttempts = Number(process.env.AUTH_MAX_LOGIN_ATTEMPTS ?? 5);
  private readonly loginLockMinutes = Number(process.env.AUTH_LOGIN_LOCK_MINUTES ?? 15);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException("El correo ya está registrado");
    }

    const passwordHash = await hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role
      }
    });

    return this.issueTokensWithSession(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException("Cuenta temporalmente bloqueada por múltiples intentos fallidos");
    }

    const isMatch = await compare(dto.password, user.passwordHash);
    if (!isMatch) {
      const nextFailedAttempts = user.failedLoginAttempts + 1;
      const mustLock = nextFailedAttempts >= this.maxLoginAttempts;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: mustLock ? 0 : nextFailedAttempts,
          lockedUntil: mustLock ? new Date(Date.now() + this.loginLockMinutes * 60_000) : null
        }
      });

      throw new UnauthorizedException("Credenciales inválidas");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    return this.issueTokensWithSession(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: string; sid: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });

      const session = await this.prisma.refreshSession.findFirst({
        where: {
          sid: payload.sid,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        }
      });

      if (!session) {
        throw new UnauthorizedException("Sesión de refresh inválida o revocada");
      }

      const valid = await compare(refreshToken, session.tokenHash);
      if (!valid) {
        throw new UnauthorizedException("Refresh token inválido");
      }

      await this.prisma.refreshSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });

      return this.issueTokensWithSession(payload.sub, payload.email, payload.role as "CLIENT" | "VETERINARY" | "ADMIN");
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; sid: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });

      const session = await this.prisma.refreshSession.findFirst({
        where: { sid: payload.sid, userId: payload.sub, revokedAt: null }
      });

      if (session) {
        await this.prisma.refreshSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() }
        });
      }

      return { success: true };
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }
  }

  private async issueTokensWithSession(userId: string, email: string, role: "CLIENT" | "VETERINARY" | "ADMIN") {
    const sid = randomUUID();
    const tokens = await this.signTokens(userId, email, role, sid);
    await this.persistRefreshSession(userId, sid, tokens.refreshToken);
    return tokens;
  }

  private async signTokens(userId: string, email: string, role: "CLIENT" | "VETERINARY" | "ADMIN", sid: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email, role },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m"
        }
      ),
      this.jwt.signAsync(
        { sub: userId, email, role, sid },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"
        }
      )
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      role
    };
  }

  private async persistRefreshSession(userId: string, sid: string, refreshToken: string) {
    const decoded = this.jwt.decode(refreshToken) as { exp?: number } | null;

    if (!decoded?.exp) {
      throw new UnauthorizedException("No se pudo calcular la expiración del refresh token");
    }

    const tokenHash = await hash(refreshToken, 10);

    await this.prisma.refreshSession.create({
      data: {
        userId,
        sid,
        tokenHash,
        expiresAt: new Date(decoded.exp * 1000)
      }
    });
  }
}
