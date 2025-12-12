import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TenantUserStatus } from '../entities/tenant-user.entity';

export class AddTenantUserDto {
  @ApiProperty({
    description: 'User ID to add to tenant',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'User status in tenant',
    enum: TenantUserStatus,
    default: TenantUserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TenantUserStatus)
  status?: TenantUserStatus;
}

