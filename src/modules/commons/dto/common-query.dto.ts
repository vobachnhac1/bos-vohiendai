import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CommonQueryDto extends PaginationDto {
  @ApiPropertyOptional({ 
    example: 'vessel_type', 
    description: 'Filter by type' 
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ 
    example: 'cargo_ship', 
    description: 'Filter by key (partial match)' 
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ 
    example: 'Cargo Ship', 
    description: 'Filter by value (partial match)' 
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Filter by status (active/inactive)' 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  status?: boolean;
}
