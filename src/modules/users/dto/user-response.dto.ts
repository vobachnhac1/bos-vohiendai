import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: '1', description: 'User ID' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'john_doe', description: 'Username' })
  @Expose()
  username: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @Expose()
  fullName?: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'ops', description: 'User role' })
  @Expose()
  role: string;

  @ApiProperty({ example: true, description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ example: '2023-12-01T10:30:00Z', description: 'Last login' })
  @Expose()
  lastLogin?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'User metadata' })
  @Expose()
  meta?: Record<string, any>;

  @ApiPropertyOptional({
    example: ['admin', 'manager'],
    description: 'User roles from RBAC system',
    type: [String],
  })
  @Expose()
  roles?: string[];

  @ApiPropertyOptional({
    example: ['users:read', 'users:write'],
    description: 'User permissions from RBAC system',
    type: [String],
  })
  @Expose()
  permissions?: string[];

  @ApiPropertyOptional({
    example: ['1', '2', '3'],
    description: 'Tenant IDs that user belongs to',
    type: [String],
  })
  @Expose()
  tenantIds?: string[];

  // Exclude sensitive data
  @Exclude()
  passwordHash: string;
}
