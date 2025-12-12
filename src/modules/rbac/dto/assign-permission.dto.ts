import { IsInt, IsNotEmpty, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({ 
    description: 'Role ID',
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ 
    description: 'Permission ID',
  })
  @IsInt()
  @IsNotEmpty()
  permissionId: number;

  @ApiPropertyOptional({ 
    description: 'User ID của người gán quyền',
  })
  @IsOptional()
  @IsInt()
  grantedBy?: number;
}

export class AssignMultiplePermissionsDto {
  @ApiProperty({ 
    description: 'Role ID',
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ 
    description: 'Danh sách Permission IDs',
    type: [Number]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  permissionIds: number[];

  @ApiPropertyOptional({ 
    description: 'User ID của người gán quyền',
  })
  @IsOptional()
  @IsInt()
  grantedBy?: number;
}

