import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ 
    description: 'User ID',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: 'Role ID',
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiPropertyOptional({ 
    description: 'User ID của người gán role',
  })
  @IsOptional()
  @IsString()
  assignedBy?: string;
}

export class AssignMultipleRolesDto {
  @ApiProperty({ 
    description: 'User ID',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: 'Danh sách Role IDs',
    type: [Number]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  roleIds: number[];

  @ApiPropertyOptional({ 
    description: 'User ID của người gán role',
  })
  @IsOptional()
  @IsString()
  assignedBy?: string;
}

