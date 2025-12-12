import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTenantSettingDto {
  @ApiProperty({
    description: 'Setting key (unique per tenant)',
    example: 'max_atons',
    maxLength: 100,
  })
  @IsString({ message: 'settingKey phải là chuỗi' })
  @IsNotEmpty({ message: 'settingKey không được để trống' })
  @MaxLength(100, { message: 'settingKey không được vượt quá 100 ký tự' })
  settingKey: string;

  @ApiPropertyOptional({
    description: 'Setting value',
    example: '1000',
  })
  @IsString({ message: 'settingValue phải là chuỗi' })
  settingValue?: string;
}

