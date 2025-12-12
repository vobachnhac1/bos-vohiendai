import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, MaxLength, Matches } from 'class-validator';
import { TenantStatus, TenantPlan } from '../entities/tenant.entity';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant code (short, URL-friendly identifier)',
    example: 'vung-tau',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Code must contain only lowercase letters, numbers, and hyphens',
  })
  code: string;

  @ApiProperty({
    description: 'Tenant display name',
    example: 'Vùng Tàu Port Authority',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Custom domain for tenant',
    example: 'vungtau.marine.vn',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @ApiPropertyOptional({
    description: 'Tenant status',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @ApiPropertyOptional({
    description: 'Service plan',
    enum: TenantPlan,
    example: TenantPlan.PRO,
  })
  @IsOptional()
  @IsEnum(TenantPlan)
  plan?: TenantPlan;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { region: 'south', contact: 'admin@vungtau.vn' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

