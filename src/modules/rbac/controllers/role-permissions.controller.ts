import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolePermissionsService } from '../services/role-permissions.service';
import { AssignPermissionDto, AssignMultiplePermissionsDto } from '../dto/assign-permission.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('RBAC - Role Permissions')
@Controller('role-permissions')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Gán permission cho role' })
  @ApiResponse({
    status: 201,
    description: 'Permission đã được gán cho role',
  })
  @ApiResponse({ status: 404, description: 'Role hoặc Permission không tồn tại' })
  @ApiResponse({ status: 409, description: 'Permission đã được gán cho role này' })
  async assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.rolePermissionsService.assignPermission(assignPermissionDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Gán nhiều permissions cho role' })
  @ApiResponse({
    status: 201,
    description: 'Permissions đã được gán cho role',
  })
  async assignMultiplePermissions(@Body() dto: AssignMultiplePermissionsDto) {
    return this.rolePermissionsService.assignMultiplePermissions(dto);
  }

  @Put('role/:roleId/sync')
  @ApiOperation({ summary: 'Đồng bộ permissions cho role (xóa cũ, thêm mới)' })
  @ApiResponse({
    status: 200,
    description: 'Permissions đã được đồng bộ',
  })
  async syncRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() body: { permissionIds: number[]; grantedBy?: number },
  ) {
    return this.rolePermissionsService.syncRolePermissions(
      roleId,
      body.permissionIds,
      body.grantedBy,
    );
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Lấy danh sách permissions của role' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách permissions',
  })
  async getPermissionsByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.rolePermissionsService.getPermissionsByRole(roleId);
  }

  @Get('permission/:permissionId')
  @ApiOperation({ summary: 'Lấy danh sách roles có permission này' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách roles',
  })
  async getRolesByPermission(@Param('permissionId', ParseIntPipe) permissionId: number) {
    return this.rolePermissionsService.getRolesByPermission(permissionId);
  }

  @Delete('role/:roleId/permission/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa permission khỏi role' })
  @ApiResponse({ status: 204, description: 'Permission đã được xóa khỏi role' })
  @ApiResponse({ status: 404, description: 'Permission assignment không tồn tại' })
  async removePermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    await this.rolePermissionsService.removePermission(roleId, permissionId);
  }

  @Delete('role/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa tất cả permissions khỏi role' })
  @ApiResponse({ status: 204, description: 'Tất cả permissions đã được xóa' })
  async removeAllPermissionsFromRole(@Param('roleId', ParseIntPipe) roleId: number) {
    await this.rolePermissionsService.removeAllPermissionsFromRole(roleId);
  }
}

