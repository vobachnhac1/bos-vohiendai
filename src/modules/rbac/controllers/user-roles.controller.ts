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
import { UserRolesService } from '../services/user-roles.service';
import { AssignRoleDto, AssignMultipleRolesDto } from '../dto/assign-role.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('RBAC - User Roles')
@Controller('user-roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @RequirePermissions('role.assign')
  @ApiOperation({ summary: 'Gán role cho user' })
  @ApiResponse({
    status: 201,
    description: 'Role đã được gán cho user',
  })
  @ApiResponse({ status: 404, description: 'User hoặc Role không tồn tại' })
  @ApiResponse({ status: 409, description: 'Role đã được gán cho user này' })
  @ApiResponse({ status: 403, description: 'Không có quyền role.assign' })
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.userRolesService.assignRole(assignRoleDto);
  }

  @Post('bulk')
  @RequirePermissions('role.assign')
  @ApiOperation({ summary: 'Gán nhiều roles cho user' })
  @ApiResponse({
    status: 201,
    description: 'Roles đã được gán cho user',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.assign' })
  async assignMultipleRoles(@Body() dto: AssignMultipleRolesDto) {
    return this.userRolesService.assignMultipleRoles(dto);
  }

  @Put('user/:userId/sync')
  @RequirePermissions('role.assign')
  @ApiOperation({ summary: 'Đồng bộ roles cho user (xóa cũ, thêm mới)' })
  @ApiResponse({
    status: 200,
    description: 'Roles đã được đồng bộ',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.assign' })
  async syncUserRoles(
    @Param('userId') userId: string,
    @Body() body: { roleIds: number[]; assignedBy?: string },
  ) {
    return this.userRolesService.syncUserRoles(
      userId,
      body.roleIds,
      body.assignedBy,
    );
  }

  @Get('user/:userId')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Lấy danh sách roles của user' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách roles',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async getRolesByUser(@Param('userId') userId: string) {
    return this.userRolesService.getRolesByUser(userId);
  }

  @Get('user/:userId/permissions')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Lấy danh sách permissions của user (từ tất cả roles)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách permission codes',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async getUserPermissions(@Param('userId') userId: string) {
    const permissions = await this.userRolesService.getUserPermissions(userId);
    return { userId, permissions };
  }

  @Get('user/:userId/check-permission/:permissionCode')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Kiểm tra user có permission không' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async checkUserPermission(
    @Param('userId') userId: string,
    @Param('permissionCode') permissionCode: string,
  ) {
    const hasPermission = await this.userRolesService.checkUserPermission(userId, permissionCode);
    return { userId, permissionCode, hasPermission };
  }

  @Get('role/:roleId')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'Lấy danh sách users có role này' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách users',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền role.view' })
  async getUsersByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.userRolesService.getUsersByRole(roleId);
  }

  @Delete('user/:userId/role/:roleId')
  @RequirePermissions('role.revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa role khỏi user' })
  @ApiResponse({ status: 204, description: 'Role đã được xóa khỏi user' })
  @ApiResponse({ status: 404, description: 'Role assignment không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền role.revoke' })
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    await this.userRolesService.removeRole(userId, roleId);
  }

  @Delete('user/:userId')
  @RequirePermissions('role.revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa tất cả roles khỏi user' })
  @ApiResponse({ status: 204, description: 'Tất cả roles đã được xóa' })
  @ApiResponse({ status: 403, description: 'Không có quyền role.revoke' })
  async removeAllRolesFromUser(@Param('userId') userId: string) {
    await this.userRolesService.removeAllRolesFromUser(userId);
  }
}

