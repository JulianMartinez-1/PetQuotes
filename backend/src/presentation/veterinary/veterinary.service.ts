import { Injectable, NotFoundException } from '@nestjs/common';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '@shared/prisma/prisma.service';

export class UpdateMyProfileDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @IsOptional() @IsString() @MaxLength(200) email?: string;
  @IsOptional() @IsString() @MaxLength(300) website?: string;
  @IsOptional() @IsString() @MaxLength(500) logo?: string;
  @IsOptional() @IsString() @MaxLength(200) branchCity?: string;
  @IsOptional() @IsString() @MaxLength(500) branchAddress?: string;
  @IsOptional() @IsString() @MaxLength(50) branchPhone?: string;
  @IsOptional() @IsString() @MaxLength(500) openingHours?: string;
  @IsOptional() @IsString() @MaxLength(300) serviceArea?: string;
  @IsOptional() @IsBoolean() homeVisits?: boolean;
  @IsOptional() @IsNumber() coverageRadius?: number;
}

@Injectable()
export class VeterinaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.veterinaryProfile.findUnique({
      where: { userId },
      include: {
        clinic: {
          include: {
            branches: true,
            services: { select: { id: true, name: true, category: true, price: true, duration: true } },
          },
        },
      },
    });

    if (!profile) throw new NotFoundException('Perfil veterinario no encontrado');

    return profile;
  }

  async updateMyProfile(userId: string, dto: UpdateMyProfileDto) {
    const profile = await this.prisma.veterinaryProfile.findUnique({
      where: { userId },
      include: { clinic: { include: { branches: { take: 1 } } } },
    });

    if (!profile) throw new NotFoundException('Perfil veterinario no encontrado');

    if (profile.veterinaryType === 'CLINIC' && profile.clinic) {
      const clinicUpdate: Record<string, unknown> = {};
      if (dto.name !== undefined) clinicUpdate.name = dto.name;
      if (dto.description !== undefined) clinicUpdate.description = dto.description;
      if (dto.phone !== undefined) clinicUpdate.phone = dto.phone;
      if (dto.email !== undefined) clinicUpdate.email = dto.email;
      if (dto.website !== undefined) clinicUpdate.website = dto.website;
      if (dto.logo !== undefined) clinicUpdate.logo = dto.logo;

      if (Object.keys(clinicUpdate).length > 0) {
        await this.prisma.clinic.update({ where: { id: profile.clinic.id }, data: clinicUpdate });
      }

      const branch = profile.clinic.branches[0];
      if (branch) {
        const branchUpdate: Record<string, unknown> = {};
        if (dto.branchCity !== undefined) branchUpdate.city = dto.branchCity;
        if (dto.branchAddress !== undefined) branchUpdate.address = dto.branchAddress;
        if (dto.branchPhone !== undefined) branchUpdate.phone = dto.branchPhone;
        if (dto.openingHours !== undefined) branchUpdate.openingHours = dto.openingHours;

        if (Object.keys(branchUpdate).length > 0) {
          await this.prisma.branch.update({ where: { id: branch.id }, data: branchUpdate });
        }
      }
    } else if (profile.veterinaryType === 'INDEPENDENT') {
      const profileUpdate: Record<string, unknown> = {};
      if (dto.serviceArea !== undefined) profileUpdate.serviceArea = dto.serviceArea;
      if (dto.homeVisits !== undefined) profileUpdate.homeVisits = dto.homeVisits;
      if (dto.coverageRadius !== undefined) profileUpdate.coverageRadius = dto.coverageRadius;

      if (Object.keys(profileUpdate).length > 0) {
        await this.prisma.veterinaryProfile.update({ where: { userId }, data: profileUpdate });
      }
    }

    return this.getMyProfile(userId);
  }
}
