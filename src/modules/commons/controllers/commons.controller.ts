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
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommonsService } from '../services/commons.service';
import { CommonsLookupService } from '../services/commons-lookup.service';
import { CreateCommonDto } from '../dto/create-common.dto';
import { UpdateCommonDto } from '../dto/update-common.dto';
import { CommonQueryDto } from '../dto/common-query.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';

@ApiTags('Commons - Quản lý cấu hình chung')
@Controller('commons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class CommonsController {
  constructor(
    private readonly commonsService: CommonsService,
    private readonly commonsLookupService: CommonsLookupService,
  ) {}

  @Post()
  @RequirePermissions('common.create')
  @ApiOperation({ summary: 'Create a new common configuration' })
  @ApiResponse({ status: 201, description: 'Common configuration created successfully' })
  @ApiResponse({ status: 409, description: 'Common with same type and key already exists' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.create' })
  create(@Body() createCommonDto: CreateCommonDto) {
    return this.commonsService.create(createCommonDto);
  }

  @Get()
  @RequirePermissions('common.view')
  @ApiOperation({ summary: 'Get all common configurations with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of common configurations' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.view' })
  findAll(@Query() query: CommonQueryDto) {
    return this.commonsService.findAll(query);
  }

  @Get('type/:type')
  @RequirePermissions('common.view')
  @ApiOperation({ summary: 'Get all active configurations by type' })
  @ApiParam({ name: 'type', description: 'Configuration type' })
  @ApiResponse({ status: 200, description: 'List of configurations for the specified type' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.view' })
  findByType(@Param('type') type: string) {
    return this.commonsService.findByType(type);
  }

  @Get('type/:type/key/:key')
  @RequirePermissions('common.view')
  @ApiOperation({ summary: 'Get configuration by type and key' })
  @ApiParam({ name: 'type', description: 'Configuration type' })
  @ApiParam({ name: 'key', description: 'Configuration key' })
  @ApiResponse({ status: 200, description: 'Configuration found' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.view' })
  findByTypeAndKey(
    @Param('type') type: string,
    @Param('key') key: string,
  ) {
    return this.commonsService.findByTypeAndKey(type, key);
  }

  @Get(':id')
  @RequirePermissions('common.view')
  @ApiOperation({ summary: 'Get a common configuration by ID' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ status: 200, description: 'Configuration found' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.view' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commonsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('common.edit')
  @ApiOperation({ summary: 'Update a common configuration' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 409, description: 'Conflict with existing configuration' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.edit' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommonDto: UpdateCommonDto,
  ) {
    return this.commonsService.update(id, updateCommonDto);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('common.edit')
  @ApiOperation({ summary: 'Toggle the status of a common configuration' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.edit' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.commonsService.toggleStatus(id);
  }

  @Delete(':id')
  @RequirePermissions('common.delete')
  @ApiOperation({ summary: 'Delete a common configuration' })
  @ApiParam({ name: 'id', description: 'Configuration ID' })
  @ApiResponse({ status: 200, description: 'Configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commonsService.remove(id);
  }

  // Lookup endpoints - Public access (chỉ cần authenticated)
  @Get('lookup/vessel-types')
  @RequirePermissions('common.view')
  @ApiOperation({ summary: 'Get all vessel types as key-value pairs' })
  @ApiResponse({ status: 200, description: 'Vessel types lookup' })
  getVesselTypes() {
    return this.commonsLookupService.getVesselTypes();
  }

  @Get('lookup/nav-statuses')
  @RequirePermissions('common.view')
  @ApiOperation({ summary: 'Get all navigation statuses as key-value pairs' })
  @ApiResponse({ status: 200, description: 'Navigation statuses lookup' })
  getNavStatuses() {
    return this.commonsLookupService.getNavStatuses();
  }

  @Get('lookup/ais-message-types')
  @RequirePermissions('common.view')
  @ApiOperation({ summary: 'Get all AIS message types as key-value pairs' })
  @ApiResponse({ status: 200, description: 'AIS message types lookup' })
  getAisMessageTypes() {
    return this.commonsLookupService.getAisMessageTypes();
  }

  // Seed data endpoints - Admin only
  @Post('seed/nav-statuses')
  @RequirePermissions('common.manage')
  @ApiOperation({ summary: 'Seed navigation status data (Admin only)' })
  @ApiResponse({ status: 201, description: 'Navigation status data seeded successfully' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.manage' })
  async seedNavStatuses() {
    await this.commonsService.seedNavigationStatuses();
    return { message: 'Navigation status data seeded successfully' };
  }

  @Post('seed/vessel-types')
  @RequirePermissions('common.manage')
  @ApiOperation({ summary: 'Seed vessel type data (Admin only)' })
  @ApiResponse({ status: 201, description: 'Vessel type data seeded successfully' })
  @ApiResponse({ status: 403, description: 'Không có quyền common.manage' })
  async seedVesselTypes() {
    await this.commonsService.seedVesselTypes();
    return { message: 'Vessel type data seeded successfully' };
  }
}
