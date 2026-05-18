import { Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from '@business/users/users.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@shared/types';
import { UpdateUserDto, UserResponseDto } from './users.dto';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UserService) {}

  /**
   * Get current user profile
   * GET /api/users/me
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.sub);
  }

  /**
   * Update current user profile
   * PATCH /api/users/me
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.sub, dto);
  }
}
