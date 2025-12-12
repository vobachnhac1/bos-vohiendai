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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantsService } from '../services/tenants.service';
import { TenantUsersService } from '../services/tenant-users.service';
import { TenantSettingsService } from '../services/tenant-settings.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantQueryDto } from '../dto/tenant-query.dto';
import { AddTenantUserDto } from '../dto/add-tenant-user.dto';

@ApiTags('Tenants - Quản lý nhiều tenants')
@Controller('tenants')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly tenantUsersService: TenantUsersService,
    private readonly tenantSettingsService: TenantSettingsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo mới tenant',
    description: 'Tạo mới tenant theo mô hình multi-tenant',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo mới tenant thành công',
  })
  @ApiResponse({
    status: 409,
    description: 'Tenant đã tồn tại',
  })
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req?: any) {
    const userId = req?.user?.id;
    return await this.tenantsService.create(createTenantDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tenants',
    description: 'Lấy danh sách tenants với phân trang và lọc theo trạng thái',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách tenants thành công',
  })
  async findAll(@Query() query: TenantQueryDto) {
    return await this.tenantsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin tenant theo ID',
    description: 'Lấy thông tin chi tiết của tenant bao gồm danh sách users',
  })
  @ApiParam({
    name: 'id',
    description: 'Tenant ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tenant thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tenant',
  })
  async findOne(@Param('id') id: string) {
    return await this.tenantsService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Lấy thông tin tenant theo code',
    description: 'Lấy thông tin chi tiết của tenant theo code',
  })
  @ApiParam({
    name: 'code',
    description: 'Tenant code',
    example: 'vung-tau',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tenant thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tenant',
  })
  async findByCode(@Param('code') code: string) {
    return await this.tenantsService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin tenant',
    description: 'Cập nhật thông tin của tenant',
  })
  @ApiParam({
    name: 'id',
    description: 'Tenant ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin tenant thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tenant',
  })
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto, @Request() req?: any) {
    const userId = req?.user?.id;
    return await this.tenantsService.update(id, updateTenantDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xoá tenant',
    description: 'Xoá tenant (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'Tenant ID',
    example: '1',
  })
  @ApiResponse({
    status: 204,
    description: 'Xoá tenant thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tenant',
  })
  async remove(@Param('id') id: string) {
    return await this.tenantsService.remove(id);
  }

  // ==================== Tenant Users Endpoints ====================

  @Post(':id/users')
  @ApiOperation({
    summary: 'Thêm user vào tenant',
    description: 'Thêm user vào tenant với vai trò và trạng thái',
  })
  @ApiParam({
    name: 'id',
    description: 'Tenant ID',
    example: '1',
  })
  @ApiResponse({
    status: 201,
    description: 'Thêm user vào tenant thành công',
  })
  @ApiResponse({
    status: 409,
    description: 'User đã tồn tại trong tenant',
  })
  async addUser(@Param('id') tenantId: string, @Body() addUserDto: AddTenantUserDto, @Request() req?: any) {
    const userId = req?.user?.id;
    return await this.tenantUsersService.addUserToTenant(tenantId, addUserDto, userId);
  }

  @Get(':id/users')
  @ApiOperation({
    summary: 'Lấy danh sách users trong tenant',
    description: 'Lấy danh sách users trong tenant',
  })
  @ApiParam({
    name: 'id',
    description: 'Tenant ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách users trong tenant thành công',
  })
  async getTenantUsers(@Param('id') tenantId: string) {
    return await this.tenantUsersService.getTenantUsers(tenantId);
  }

  @Delete(':tenantId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xoá user khỏi tenant',
    description: 'Xoá user khỏi tenant',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant ID',
    example: '1',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '1',
  })
  @ApiResponse({
    status: 204,
    description: 'Xoá user khỏi tenant thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại trong tenant',
  })
  async removeUser(@Param('tenantId') tenantId: string, @Param('userId') userId: string) {
    return await this.tenantUsersService.removeUserFromTenant(tenantId, userId);
  }

  // ==================== TENANT ATON MANAGEMENT ====================

  // @Post(':id/atons')
  // @ApiOperation({
  //   summary: 'Phân loại AtoN cho tenant',
  //   description: 'Phân loại AtoN cho tenant với tùy chọn đặt tên và trạng thái active',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Phân loại AtoN cho tenant thành công',
  // })
  // @ApiResponse({
  //   status: 409,
  //   description: 'AtoN already assigned to tenant',
  // })
  // async assignAtonToTenant(
  //   @Param('id') tenantId: string,
  //   @Body() dto: AssignAtonToTenantDto,
  // ) {
  //   return await this.tenantAtonsService.assignAtonToTenant(tenantId, dto);
  // }

  // @Get(':id/atons')
  // @ApiOperation({
  //   summary: 'Lấy danh sách AtoNs trong tenant',
  //   description: 'Lấy danh sách AtoNs trong tenant',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiQuery({
  //   name: 'includeInactive',
  //   required: false,
  //   description: 'Bao gồm AtoNs không active',
  //   example: false,
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lấy danh sách AtoNs trong tenant thành công',
  // })
  // async getTenantAtons(
  //   @Param('id') tenantId: string,
  //   @Query('includeInactive') includeInactive?: boolean,
  // ) {
  //   return await this.tenantAtonsService.getTenantAtons(tenantId, includeInactive);
  // }

  // @Patch(':tenantId/atons/:atonId')
  // @ApiOperation({
  //   summary: 'Cập nhật thông tin AtoN trong tenant',
  //   description: 'Cập nhật thông tin của AtoN trong tenant',
  // })
  // @ApiParam({
  //   name: 'tenantId',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiParam({
  //   name: 'atonId',
  //   description: 'AtoN ID',
  //   example: '123',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Cập nhật thông tin AtoN trong tenant thành công',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'AtoN không tồn tại trong tenant',
  // })
  // async updateTenantAton(
  //   @Param('tenantId') tenantId: string,
  //   @Param('atonId') atonId: string,
  //   @Body() dto: UpdateTenantAtonDto,
  // ) {
  //   return await this.tenantAtonsService.updateTenantAton(tenantId, atonId, dto);
  // }

  // @Delete(':tenantId/atons/:atonId')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({
  //   summary: 'Bỏ phân loại AtoN khỏi tenant',
  //   description: 'Bỏ phân loại AtoN khỏi tenant',
  // })
  // @ApiParam({
  //   name: 'tenantId',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiParam({
  //   name: 'atonId',
  //   description: 'AtoN ID',
  //   example: '123',
  // })
  // @ApiResponse({
  //   status: 204,
  //   description: 'Bỏ phân loại AtoN khỏi tenant thành công',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'AtoN không tồn tại trong tenant',
  // })
  // async unassignAtonFromTenant(
  //   @Param('tenantId') tenantId: string,
  //   @Param('atonId') atonId: string,
  // ) {
  //   return await this.tenantAtonsService.unassignAtonFromTenant(tenantId, atonId);
  // }

  // ==================== TENANT SETTINGS MANAGEMENT ====================

  // @Post(':id/settings')
  // @ApiOperation({
  //   summary: 'Tạo setting mới cho tenant',
  //   description: 'Tạo setting mới cho tenant',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Tạo setting mới cho tenant thành công',
  // })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Đã tồn tại setting với key này',
  // })
  // async createSetting(
  //   @Param('id') tenantId: string,
  //   @Body() dto: CreateTenantSettingDto,
  // ) {
  //   return await this.tenantSettingsService.create(tenantId, dto);
  // }

  // @Get(':id/settings')
  // @ApiOperation({
  //   summary: 'Lấy danh sách settings của tenant',
  //   description: 'Lấy danh sách settings của tenant',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lấy danh sách settings của tenant thành công',
  // })
  // async getAllSettings(@Param('id') tenantId: string) {
  //   return await this.tenantSettingsService.findAll(tenantId);
  // }

  // @Get(':id/settings/:key')
  // @ApiOperation({
  //   summary: 'Lấy giá trị của setting',
  //   description: 'Lấy giá trị của setting',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiParam({
  //   name: 'key',
  //   description: 'Setting key',
  //   example: 'max_atons',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lấy giá trị của setting thành công',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Setting không tồn tại',
  // })
  // async getSetting(
  //   @Param('id') tenantId: string,
  //   @Param('key') settingKey: string,
  // ) {
  //   return await this.tenantSettingsService.findOne(tenantId, settingKey);
  // }

  // @Patch(':id/settings/:key')
  // @ApiOperation({
  //   summary: 'Cập nhật giá trị của setting',
  //   description: 'Cập nhật giá trị của setting',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiParam({
  //   name: 'key',
  //   description: 'Setting key',
  //   example: 'max_atons',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Cập nhật giá trị của setting thành công',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Setting không tồn tại',
  // })
  // async updateSetting(
  //   @Param('id') tenantId: string,
  //   @Param('key') settingKey: string,
  //   @Body() dto: UpdateTenantSettingDto,
  // ) {
  //   return await this.tenantSettingsService.update(tenantId, settingKey, dto);
  // }

  // @Delete(':id/settings/:key')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({
  //   summary: 'Xóa setting',
  //   description: 'Xóa setting khỏi tenant',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Tenant ID',
  //   example: '1',
  // })
  // @ApiParam({
  //   name: 'key',
  //   description: 'Setting key',
  //   example: 'max_atons',
  // })
  // @ApiResponse({
  //   status: 204,
  //   description: 'Xóa setting thành công',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Setting không tồn tại',
  // })
  // async deleteSetting(
  //   @Param('id') tenantId: string,
  //   @Param('key') settingKey: string,
  // ) {
  //   return await this.tenantSettingsService.remove(tenantId, settingKey);
  // }
}

