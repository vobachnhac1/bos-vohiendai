import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  // @IsNotEmpty()
  // @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Full display name',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User role'
  })
  @IsString()
  @IsOptional()
  role: string;

  @ApiPropertyOptional({
    description: 'User active status',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Additional user metadata',
    example: { permissions: ['read', 'write'], preferences: { theme: 'dark' } }
  })
  @IsOptional()
  meta?: Record<string, any>;
}
