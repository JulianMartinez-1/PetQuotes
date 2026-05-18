import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '@business/auth/auth.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@shared/types';
import { RegisterDto, LoginDto, TokenResponseDto } from './auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(dto.email, dto.password, dto.fullName);
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@CurrentUser() user: JwtPayload): Promise<TokenResponseDto> {
    return this.authService.refreshToken(user.sub);
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Logout (client-side only, JWT can't be revoked without session store)
   * POST /api/auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: JwtPayload) {
    // In a production app, you might invalidate the token in a store
    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Health check
   * GET /api/health
   */
  @Get('../health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
