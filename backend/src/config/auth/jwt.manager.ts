import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '@shared/types';

@Injectable()
export class JwtManager {
  private secret: string;
  private expiresIn: string;
  private refreshExpiresIn: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET') || 'change-me-in-production';
    this.expiresIn = this.configService.get<string>('JWT_EXPIRATION') || '1h';
    this.refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
  }

  generateTokens(userId: string, email: string, role: string, fullName?: string) {
    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        role,
        fullName: fullName || email.split('@')[0],
      } as JwtPayload,
      this.secret,
      { expiresIn: this.expiresIn as any },
    );

    const refreshToken = jwt.sign(
      {
        sub: userId,
        type: 'refresh',
      },
      this.secret,
      { expiresIn: this.refreshExpiresIn as any },
    );

    const decoded = jwt.decode(accessToken) as any;

    return {
      accessToken,
      refreshToken,
      expiresIn: decoded.exp - decoded.iat,
      tokenType: 'Bearer',
    };
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as unknown as JwtPayload;
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token) as unknown as JwtPayload;
  }
}
