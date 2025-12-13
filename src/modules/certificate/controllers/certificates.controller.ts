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
import { CertificatesService } from '../services/certificates.service';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';
import { CertificateQueryDto } from '../dto/certificate-query.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('Certificates')
@Controller('certificates')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  // @RequirePermissions('certificate.create')
  @ApiOperation({ summary: 'Tạo chứng chỉ mới' })
  @ApiResponse({ status: 201, description: 'Tạo chứng chỉ thành công' })
  @ApiResponse({ status: 409, description: 'Mã chứng chỉ đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền certificate.create' })
  create(@Body() createCertificateDto: CreateCertificateDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.certificatesService.create(createCertificateDto, userId);
  }

  @Get()
  // @RequirePermissions('certificate.view')
  @ApiOperation({ summary: 'Lấy danh sách chứng chỉ với filter và phân trang' })
  @ApiResponse({ status: 200, description: 'Danh sách chứng chỉ' })
  @ApiResponse({ status: 403, description: 'Không có quyền certificate.view' })
  findAll(@Query() query: CertificateQueryDto) {
    return this.certificatesService.findAll(query);
  }

  @Get(':id')
  // @RequirePermissions('certificate.view')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết chứng chỉ theo ID' })
  @ApiParam({ name: 'id', description: 'ID của chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Thông tin chứng chỉ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chứng chỉ' })
  @ApiResponse({ status: 403, description: 'Không có quyền certificate.view' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.certificatesService.findOne(id);
  }

  @Get('code/:code')
  // @RequirePermissions('certificate.view')
  @ApiOperation({ summary: 'Lấy thông tin chứng chỉ theo mã' })
  @ApiParam({ name: 'code', description: 'Mã chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Thông tin chứng chỉ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chứng chỉ' })
  @ApiResponse({ status: 403, description: 'Không có quyền certificate.view' })
  findByCode(@Param('code') code: string) {
    return this.certificatesService.findByCode(code);
  }

  @Patch(':id')
  // @RequirePermissions('certificate.update')
  @ApiOperation({ summary: 'Cập nhật thông tin chứng chỉ' })
  @ApiParam({ name: 'id', description: 'ID của chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chứng chỉ' })
  @ApiResponse({ status: 409, description: 'Mã chứng chỉ đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền certificate.update' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.certificatesService.update(id, updateCertificateDto, userId);
  }

  @Delete(':id')
  // @RequirePermissions('certificate.delete')
  @ApiOperation({ summary: 'Xóa chứng chỉ (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID của chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chứng chỉ' })
  @ApiResponse({ status: 403, description: 'Không có quyền certificate.delete' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.certificatesService.remove(id, userId);
  }

  @Patch(':id/toggle-status')
  // @RequirePermissions('certificate.update')
  @ApiOperation({ summary: 'Chuyển đổi trạng thái chứng chỉ (active/inactive)' })
  @ApiParam({ name: 'id', description: 'ID của chứng chỉ' })
  @ApiResponse({ status: 200, description: 'Chuyển đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chứng chỉ' })
  @ApiResponse({ status: 403, description: 'Không có quyền certificate.update' })
  toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.userId;
    return this.certificatesService.toggleStatus(id, userId);
  }
}

