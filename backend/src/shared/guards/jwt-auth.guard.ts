import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, AuthenticatedRequest } from '@shared/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private secret: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET') || 'change-me-in-production';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = jwt.verify(token, this.secret) as unknown as JwtPayload;
      (request as unknown as AuthenticatedRequest).user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [scheme, token] = authHeader.split(' ');
      if (scheme === 'Bearer' && token) return token;
    }

    // Fallback: accept refreshToken from request body (used by the Next.js
    // refresh proxy which forwards the httpOnly cookie value in the body).
    const body = (request as any).body as Record<string, unknown> | undefined;
    if (body?.refreshToken && typeof body.refreshToken === 'string') {
      return body.refreshToken;
    }

    return null;
  }
}
