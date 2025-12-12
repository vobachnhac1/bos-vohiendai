import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTenantSettingDto {
  @ApiPropertyOptional({
    description: 'Setting value',
    example: '2000',
  })
  @IsOptional()
  @IsString({ message: 'settingValue phải là chuỗi' })
  settingValue?: string;
}

