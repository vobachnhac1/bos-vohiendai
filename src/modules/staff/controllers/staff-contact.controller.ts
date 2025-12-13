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
import { StaffContactService } from '../services/staff-contact.service';
import { CreateStaffContactDto } from '../dto/create-staff-contact.dto';
import { UpdateStaffContactDto } from '../dto/update-staff-contact.dto';
import { StaffContactQueryDto } from '../dto/staff-contact-query.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
// import { PermissionsGuard } from '../../../guards/permissions.guard';
// import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('Staff Contacts')
@Controller('staff-contacts')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffContactController {
  constructor(private readonly staffContactService: StaffContactService) {}

  @Post()
  // @RequirePermissions('staff.contact.create')
  @ApiOperation({ summary: 'Tạo thông tin liên hệ cho nhân viên' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.contact.create',
  })
  create(@Body() createStaffContactDto: CreateStaffContactDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffContactService.create(createStaffContactDto, userId);
  }

  @Get()
  // @RequirePermissions('staff.contact.view')
  @ApiOperation({
    summary: 'Lấy danh sách thông tin liên hệ với filter và phân trang',
  })
  @ApiResponse({ status: 200, description: 'Danh sách thông tin liên hệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.contact.view' })
  findAll(@Query() query: StaffContactQueryDto) {
    return this.staffContactService.findAll(query);
  }

  @Get('staff/:staffId')
  // @RequirePermissions('staff.contact.view')
  @ApiOperation({ summary: 'Lấy tất cả thông tin liên hệ của một nhân viên' })
  @ApiParam({ name: 'staffId', description: 'ID của nhân viên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thông tin liên hệ của nhân viên',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.contact.view' })
  findByStaff(@Param('staffId', ParseIntPipe) staffId: number) {
    return this.staffContactService.findByStaff(staffId);
  }

  @Get('staff/:staffId/primary')
  // @RequirePermissions('staff.contact.view')
  @ApiOperation({ summary: 'Lấy thông tin liên hệ chính của nhân viên' })
  @ApiParam({ name: 'staffId', description: 'ID của nhân viên' })
  @ApiResponse({ status: 200, description: 'Thông tin liên hệ chính' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.contact.view' })
  findPrimaryContact(@Param('staffId', ParseIntPipe) staffId: number) {
    return this.staffContactService.findPrimaryContact(staffId);
  }

  @Get(':id')
  // @RequirePermissions('staff.contact.view')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết liên hệ theo ID' })
  @ApiParam({ name: 'id', description: 'ID của staff contact' })
  @ApiResponse({ status: 200, description: 'Thông tin liên hệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền staff.contact.view' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffContactService.findOne(id);
  }

  @Patch(':id')
  // @RequirePermissions('staff.contact.update')
  @ApiOperation({ summary: 'Cập nhật thông tin liên hệ' })
  @ApiParam({ name: 'id', description: 'ID của staff contact' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.contact.update',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffContactDto: UpdateStaffContactDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.staffContactService.update(id, updateStaffContactDto, userId);
  }

  @Delete(':id')
  // @RequirePermissions('staff.contact.delete')
  @ApiOperation({ summary: 'Xóa thông tin liên hệ (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID của staff contact' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.contact.delete',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffContactService.remove(id, userId);
  }

  @Patch(':id/set-primary')
  // @RequirePermissions('staff.contact.update')
  @ApiOperation({ summary: 'Đặt làm liên hệ chính' })
  @ApiParam({ name: 'id', description: 'ID của staff contact' })
  @ApiResponse({ status: 200, description: 'Đặt làm liên hệ chính thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.contact.update',
  })
  setPrimary(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffContactService.setPrimary(id, userId);
  }

  @Patch(':id/toggle-status')
  // @RequirePermissions('staff.contact.update')
  @ApiOperation({ summary: 'Chuyển đổi trạng thái (đang dùng/không dùng)' })
  @ApiParam({ name: 'id', description: 'ID của staff contact' })
  @ApiResponse({ status: 200, description: 'Chuyển đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.contact.update',
  })
  toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffContactService.toggleStatus(id, userId);
  }
}

