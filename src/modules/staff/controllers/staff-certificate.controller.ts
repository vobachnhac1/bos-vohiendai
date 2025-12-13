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
import { StaffCertificateService } from '../services/staff-certificate.service';
import { CreateStaffCertificateDto } from '../dto/create-staff-certificate.dto';
import { UpdateStaffCertificateDto } from '../dto/update-staff-certificate.dto';
import { StaffCertificateQueryDto } from '../dto/staff-certificate-query.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('Staff Certificates')
@Controller('staff-certificates')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffCertificateController {
  constructor(
    private readonly staffCertificateService: StaffCertificateService,
  ) {}

  @Post()
  // @RequirePermissions('staff.certificate.create')
  @ApiOperation({ summary: 'Gán chứng chỉ cho nhân viên' })
  @ApiResponse({ status: 201, description: 'Gán chứng chỉ thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên hoặc chứng chỉ' })
  @ApiResponse({ status: 409, description: 'Nhân viên đã có chứng chỉ này' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.create',
  })
  create(
    @Body() createStaffCertificateDto: CreateStaffCertificateDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.staffCertificateService.create(
      createStaffCertificateDto,
      userId,
    );
  }

  @Get()
  // @RequirePermissions('staff.certificate.view')
  @ApiOperation({
    summary: 'Lấy danh sách chứng chỉ của nhân viên với filter và phân trang',
  })
  @ApiResponse({ status: 200, description: 'Danh sách chứng chỉ nhân viên' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.view',
  })
  findAll(@Query() query: StaffCertificateQueryDto) {
    return this.staffCertificateService.findAll(query);
  }

  @Get('staff/:staffId')
  // @RequirePermissions('staff.certificate.view')
  @ApiOperation({ summary: 'Lấy tất cả chứng chỉ của một nhân viên' })
  @ApiParam({ name: 'staffId', description: 'ID của nhân viên' })
  @ApiResponse({ status: 200, description: 'Danh sách chứng chỉ của nhân viên' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.view',
  })
  findByStaff(@Param('staffId', ParseIntPipe) staffId: number) {
    return this.staffCertificateService.findByStaff(staffId);
  }

  @Get('certificate/:certificateId')
  // @RequirePermissions('staff.certificate.view')
  @ApiOperation({ summary: 'Lấy tất cả nhân viên có chứng chỉ này' })
  @ApiParam({ name: 'certificateId', description: 'ID của chứng chỉ' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhân viên có chứng chỉ này',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.view',
  })
  findByCertificate(@Param('certificateId', ParseIntPipe) certificateId: number) {
    return this.staffCertificateService.findByCertificate(certificateId);
  }

  @Get(':id')
  // @RequirePermissions('staff.certificate.view')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết chứng chỉ nhân viên theo ID' })
  @ApiParam({ name: 'id', description: 'ID của staff certificate' })
  @ApiResponse({ status: 200, description: 'Thông tin chứng chỉ nhân viên' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.view',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffCertificateService.findOne(id);
  }

  @Patch(':id')
  // @RequirePermissions('staff.certificate.update')
  @ApiOperation({ summary: 'Cập nhật thông tin chứng chỉ nhân viên' })
  @ApiParam({ name: 'id', description: 'ID của staff certificate' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.update',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffCertificateDto: UpdateStaffCertificateDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.staffCertificateService.update(
      id,
      updateStaffCertificateDto,
      userId,
    );
  }

  @Delete(':id')
  // @RequirePermissions('staff.certificate.delete')
  @ApiOperation({ summary: 'Xóa chứng chỉ nhân viên (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID của staff certificate' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.delete',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffCertificateService.remove(id, userId);
  }

  @Patch(':id/toggle-status')
  // @RequirePermissions('staff.certificate.update')
  @ApiOperation({
    summary: 'Chuyển đổi trạng thái chứng chỉ (còn hiệu lực/hết hiệu lực)',
  })
  @ApiParam({ name: 'id', description: 'ID của staff certificate' })
  @ApiResponse({ status: 200, description: 'Chuyển đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền staff.certificate.update',
  })
  toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.staffCertificateService.toggleStatus(id, userId);
  }
}
