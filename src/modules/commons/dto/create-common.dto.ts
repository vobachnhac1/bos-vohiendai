import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCommonDto {
  @ApiProperty({ 
    example: 'vessel_type', 
    description: 'Type/category of the configuration item',
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @ApiProperty({ 
    example: 'cargo_ship', 
    description: 'Unique key within the type',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key: string;

  @ApiPropertyOptional({ 
    example: 'Cargo Ship', 
    description: 'Value associated with the key'
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ 
    example: 'Commercial vessel for transporting cargo',
    description: 'Description of the configuration item',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether the item is active/enabled',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}
