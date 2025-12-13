import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffQueryDto } from '../dto/staff-query.dto';
// import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
// import { PermissionsGuard } from '../../../guards/permissions.guard';
// import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('Staff')
@Controller('staff')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  // @RequirePermissions('staff.create')
  @ApiOperation({ summary: 'Tạo nhân viên mới' })
  @ApiResponse({ status: 201, description: 'Tạo nhân viên thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.create' })
  create(@Body() createStaffDto: CreateStaffDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffService.create(createStaffDto, userId);
  }

  @Get()
  // @RequirePermissions('staff.view')
  @ApiOperation({ summary: 'Lấy danh sách nhân viên với filter và phân trang' })
  @ApiResponse({ status: 200, description: 'Danh sách nhân viên' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.view' })
  findAll(@Query() query: StaffQueryDto) {
    return this.staffService.findAll(query);
  }

  @Get('tenant/:tenantId')
  // @RequirePermissions('staff.view')
  @ApiOperation({ summary: 'Lấy danh sách nhân viên theo tenant' })
  @ApiParam({ name: 'tenantId', description: 'ID của tenant' })
  @ApiResponse({ status: 200, description: 'Danh sách nhân viên của tenant' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.view' })
  findByTenant(@Param('tenantId', ParseIntPipe) tenantId: number) {
    return this.staffService.findByTenant(tenantId);
  }

  @Get(':id')
  // @RequirePermissions('staff.view')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết nhân viên theo ID' })
  @ApiParam({ name: 'id', description: 'ID của nhân viên' })
  @ApiResponse({ status: 200, description: 'Thông tin nhân viên' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.view' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  // @RequirePermissions('staff.update')
  @ApiOperation({ summary: 'Cập nhật thông tin nhân viên' })
  @ApiParam({ name: 'id', description: 'ID của nhân viên' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.update' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffDto: UpdateStaffDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.staffService.update(id, updateStaffDto, userId);
  }

  @Delete(':id')
  // @RequirePermissions('staff.delete')
  @ApiOperation({ summary: 'Xóa nhân viên (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID của nhân viên' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.delete' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffService.remove(id, userId);
  }

  @Patch(':id/status/:status')
  // @RequirePermissions('staff.update')
  @ApiOperation({ summary: 'Cập nhật trạng thái nhân viên' })
  @ApiParam({ name: 'id', description: 'ID của nhân viên' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái mới (0: Không hoạt động, 1: Đang hoạt động, 2: Tạm nghỉ)',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.update' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status', ParseIntPipe) status: number,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.staffService.updateStatus(id, status, userId);
  }
}

