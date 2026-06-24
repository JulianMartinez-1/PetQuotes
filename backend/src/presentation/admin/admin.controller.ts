import {
  Controller, Get, Patch, Param, Body, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators';
import { IsString, MinLength } from 'class-validator';

class RejectVetRequestDto {
  @IsString()
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  reason: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('veterinary-requests')
  @HttpCode(HttpStatus.OK)
  async getVeterinaryRequests(
    @Query('status') status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING',
  ) {
    return this.adminService.getVeterinaryRequests(status);
  }

  @Patch('veterinary-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveVeterinaryRequest(@Param('id') id: string) {
    return this.adminService.approveVeterinaryRequest(id);
  }

  @Patch('veterinary-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectVeterinaryRequest(
    @Param('id') id: string,
    @Body() dto: RejectVetRequestDto,
  ) {
    return this.adminService.rejectVeterinaryRequest(id, dto.reason);
  }
}
