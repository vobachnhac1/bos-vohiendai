import { IsEmail, IsString, MinLength, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'password123', description: 'User password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Full display name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'ops', 
    description: 'User role',
    enum: ['admin', 'ops', 'viewer', 'analyst']
  })
  @IsString()
  @IsIn(['admin', 'ops', 'viewer', 'analyst'])
  role: string;

  @ApiPropertyOptional({ example: true, description: 'User active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    example: { permissions: ['read', 'write'], preferences: { theme: 'dark' } },
    description: 'Additional user metadata'
  })
  @IsOptional()
  meta?: Record<string, any>;
}
