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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectQueryDto } from '../dto/subject-query.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('Subjects')
@Controller('subjects')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  // @RequirePermissions('subject.create')
  @ApiOperation({ summary: 'Tạo môn học mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'Mã môn học đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.create' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Get()
  // @RequirePermissions('subject.view')
  @ApiOperation({ summary: 'Lấy danh sách môn học với filter và phân trang' })
  @ApiResponse({ status: 200, description: 'Danh sách môn học' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.view' })
  findAll(@Query() query: SubjectQueryDto) {
    return this.subjectService.findAll(query);
  }

  @Get('code/:code')
  // @RequirePermissions('subject.view')
  @ApiOperation({ summary: 'Lấy môn học theo mã code' })
  @ApiParam({ name: 'code', description: 'Mã môn học' })
  @ApiResponse({ status: 200, description: 'Thông tin môn học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.view' })
  findByCode(@Param('code') code: string) {
    return this.subjectService.findByCode(code);
  }

  @Get(':id')
  // @RequirePermissions('subject.view')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết môn học theo ID' })
  @ApiParam({ name: 'id', description: 'ID của môn học' })
  @ApiResponse({ status: 200, description: 'Thông tin môn học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.view' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id);
  }

  @Patch(':id')
  // @RequirePermissions('subject.update')
  @ApiOperation({ summary: 'Cập nhật thông tin môn học' })
  @ApiParam({ name: 'id', description: 'ID của môn học' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 409, description: 'Mã môn học đã tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.update' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  // @RequirePermissions('subject.delete')
  @ApiOperation({ summary: 'Xóa môn học' })
  @ApiParam({ name: 'id', description: 'ID của môn học' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.remove(id);
  }

  @Patch(':id/toggle-status')
  // @RequirePermissions('subject.update')
  @ApiOperation({ summary: 'Chuyển đổi trạng thái môn học (active/inactive)' })
  @ApiParam({ name: 'id', description: 'ID của môn học' })
  @ApiResponse({ status: 200, description: 'Chuyển đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.update' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.toggleStatus(id);
  }
}

