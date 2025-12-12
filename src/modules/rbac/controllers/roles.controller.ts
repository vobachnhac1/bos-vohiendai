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
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleQueryDto } from '../dto/role-query.dto';
import { RoleResponseDto } from '../dto/role-response.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';
import { plainToClass } from 'class-transformer';

@ApiTags('RBAC - Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('role.create')
  @ApiOperation({ summary: 'Tạo role mới' })
  @ApiResponse({
    status: 201,
    description: 'Role đã được tạo thành công',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Role name đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền role.create' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return plainToClass(RoleResponseDto, role);
  }

  @Get()
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Lấy danh sách roles' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách roles',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async findAll(@Query() query: RoleQueryDto) {
    const result = await this.rolesService.findAll(query);
    return {
      ...result,
      roles: result.roles.map(role => plainToClass(RoleResponseDto, role)),
    };
  }

  @Get(':id')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Lấy role theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Role details',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.findOne(id);
    return plainToClass(RoleResponseDto, role);
  }

  @Get(':id/permissions')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Lấy role với danh sách permissions' })
  @ApiResponse({
    status: 200,
    description: 'Role với permissions',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async getRoleWithPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRoleWithPermissions(id);
  }

  @Get(':id/users')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Lấy role với danh sách users' })
  @ApiResponse({
    status: 200,
    description: 'Role với users',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async getRoleWithUsers(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRoleWithUsers(id);
  }

  @Patch(':id')
  @RequirePermissions('role.edit')
  @ApiOperation({ summary: 'Cập nhật role' })
  @ApiResponse({
    status: 200,
    description: 'Role đã được cập nhật',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role không tồn tại' })
  @ApiResponse({ status: 409, description: 'Role name đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền role.edit' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(id, updateRoleDto);
    return plainToClass(RoleResponseDto, role);
  }

  @Delete(':id')
  @RequirePermissions('role.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa role' })
  @ApiResponse({ status: 204, description: 'Role đã được xóa' })
  @ApiResponse({ status: 404, description: 'Role không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền role.delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.remove(id);
  }
}

