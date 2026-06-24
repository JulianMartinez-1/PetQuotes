import { Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VeterinaryService } from './veterinary.service';
import { UpdateMyProfileDto } from './veterinary.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles, CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@shared/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VETERINARY')
@Controller('veterinary')
export class VeterinaryController {
  constructor(private readonly veterinaryService: VeterinaryService) {}

  @Get('my-profile')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.veterinaryService.getMyProfile(user.sub);
  }

  @Patch('my-profile')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.veterinaryService.updateMyProfile(user.sub, dto);
  }
}
