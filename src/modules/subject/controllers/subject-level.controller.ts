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
import { SubjectLevelService } from '../services/subject-level.service';
import { CreateSubjectLevelDto } from '../dto/create-subject-level.dto';
import { UpdateSubjectLevelDto } from '../dto/update-subject-level.dto';
import { SubjectLevelQueryDto } from '../dto/subject-level-query.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('Subject Levels')
@Controller('subject-levels')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SubjectLevelController {
  constructor(private readonly subjectLevelService: SubjectLevelService) {}

  @Post()
  // @RequirePermissions('subject.level.create')
  @ApiOperation({ summary: 'Tạo cấp độ mới cho môn học' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy môn học' })
  @ApiResponse({
    status: 409,
    description: 'Mã cấp độ hoặc thứ tự đã tồn tại trong môn học',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền subject.level.create',
  })
  create(@Body() createSubjectLevelDto: CreateSubjectLevelDto) {
    return this.subjectLevelService.create(createSubjectLevelDto);
  }

  @Get()
  // @RequirePermissions('subject.level.view')
  @ApiOperation({
    summary: 'Lấy danh sách cấp độ với filter và phân trang',
  })
  @ApiResponse({ status: 200, description: 'Danh sách cấp độ' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.level.view' })
  findAll(@Query() query: SubjectLevelQueryDto) {
    return this.subjectLevelService.findAll(query);
  }

  @Get('subject/:subjectId')
  // @RequirePermissions('subject.level.view')
  @ApiOperation({ summary: 'Lấy tất cả cấp độ của một môn học' })
  @ApiParam({ name: 'subjectId', description: 'ID của môn học' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách cấp độ của môn học (sắp xếp theo orderIndex)',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.level.view' })
  findBySubject(@Param('subjectId', ParseIntPipe) subjectId: number) {
    return this.subjectLevelService.findBySubject(subjectId);
  }

  @Get(':id')
  // @RequirePermissions('subject.level.view')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết cấp độ theo ID' })
  @ApiParam({ name: 'id', description: 'ID của cấp độ' })
  @ApiResponse({ status: 200, description: 'Thông tin cấp độ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền subject.level.view' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectLevelService.findOne(id);
  }

  @Patch(':id')
  // @RequirePermissions('subject.level.update')
  @ApiOperation({ summary: 'Cập nhật thông tin cấp độ' })
  @ApiParam({ name: 'id', description: 'ID của cấp độ' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 409,
    description: 'Mã cấp độ hoặc thứ tự đã tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền subject.level.update',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectLevelDto: UpdateSubjectLevelDto,
  ) {
    return this.subjectLevelService.update(id, updateSubjectLevelDto);
  }

  @Delete(':id')
  // @RequirePermissions('subject.level.delete')
  @ApiOperation({ summary: 'Xóa cấp độ' })
  @ApiParam({ name: 'id', description: 'ID của cấp độ' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền subject.level.delete',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectLevelService.remove(id);
  }

  @Patch(':id/toggle-status')
  // @RequirePermissions('subject.level.update')
  @ApiOperation({ summary: 'Chuyển đổi trạng thái cấp độ (active/inactive)' })
  @ApiParam({ name: 'id', description: 'ID của cấp độ' })
  @ApiResponse({ status: 200, description: 'Chuyển đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền subject.level.update',
  })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.subjectLevelService.toggleStatus(id);
  }
}

