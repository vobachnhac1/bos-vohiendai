import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionQueryDto } from '../dto/permission-query.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';
import { plainToClass } from 'class-transformer';

@ApiTags('RBAC - Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('permission.create')
  @ApiOperation({ summary: 'Tạo permission mới' })
  @ApiResponse({
    status: 201,
    description: 'Permission đã được tạo thành công',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Permission code đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền permission.create' })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(createPermissionDto);
    return plainToClass(PermissionResponseDto, permission);
  }

  @Get()
  @RequirePermissions('permission.view')
  @ApiOperation({ summary: 'Lấy danh sách permissions' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách permissions',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền permission.view' })
  async findAll(@Query() query: PermissionQueryDto) {
    const result = await this.permissionsService.findAll(query);
    return {
      ...result,
      permissions: result.permissions.map(permission =>
        plainToClass(PermissionResponseDto, permission)
      ),
    };
  }

  @Get(':id')
  @RequirePermissions('permission.view')
  @ApiOperation({ summary: 'Lấy permission theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission details',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền permission.view' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const permission = await this.permissionsService.findOne(id);
    return plainToClass(PermissionResponseDto, permission);
  }

  @Get(':id/roles')
  @RequirePermissions('permission.view')
  @ApiOperation({ summary: 'Lấy permission với danh sách roles' })
  @ApiResponse({
    status: 200,
    description: 'Permission với roles',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền permission.view' })
  async getPermissionWithRoles(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.getPermissionWithRoles(id);
  }

  @Patch(':id')
  @RequirePermissions('permission.edit')
  @ApiOperation({ summary: 'Cập nhật permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission đã được cập nhật',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission không tồn tại' })
  @ApiResponse({ status: 409, description: 'Permission code đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền permission.edit' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.update(id, updatePermissionDto);
    return plainToClass(PermissionResponseDto, permission);
  }

  @Delete(':id')
  @RequirePermissions('permission.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa permission' })
  @ApiResponse({ status: 204, description: 'Permission đã được xóa' })
  @ApiResponse({ status: 404, description: 'Permission không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền permission.delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.permissionsService.remove(id);
  }
}

