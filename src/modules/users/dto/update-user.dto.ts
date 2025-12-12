import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ 
    example: '2023-12-01T10:30:00Z',
    description: 'Last login timestamp'
  })
  @IsOptional()
  @IsDateString()
  lastLogin?: string;
}
