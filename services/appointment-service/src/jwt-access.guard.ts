import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedRequest, AuthUser } from "./auth-context";

@Injectable()
export class JwtAccessGuard implements CanActivate {
  private readonly jwt = new JwtService();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token JWT requerido");
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = await this.jwt.verifyAsync<AuthUser>(token, { secret: process.env.JWT_ACCESS_SECRET });
      request.user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role
      };
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }
}