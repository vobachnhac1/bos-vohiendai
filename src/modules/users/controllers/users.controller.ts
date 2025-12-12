import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
  Put,
  Query,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermissions } from '../../../decorators/permissions.decorator';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { RegisterDto } from '../../auth/dto/register.dto';
import { UserQueryDto } from '../dto/user-query.dto';

@ApiTags('Users - Quản lý người dùng')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.view')
  @ApiOperation({
    summary: 'Lấy danh sách users',
    description: 'Lấy danh sách users với phân trang và filter. Yêu cầu permission: users.view'
  })
  @ApiQuery({
    name: 'tenantIds',
    required: false,
    type: [String],
    isArray: true,
    description: 'Lọc theo tenant IDs (có thể truyền nhiều giá trị, ví dụ: tenantIds=1&tenantIds=2 hoặc tenantIds=1,2)',
    example: ['1', '2']
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng items mỗi trang (mặc định: 20)' })
  @ApiQuery({ name: 'username', required: false, type: String, description: 'Lọc theo username (partial match)' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Lọc theo email (partial match)' })
  @ApiQuery({ name: 'fullName', required: false, type: String, description: 'Lọc theo full name (partial match)' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Lọc theo role' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Lọc theo trạng thái active' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách users',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserResponseDto' }
        },
        total: { type: 'number', example: 1000 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.view',
  })
  async findAll(@Query() query: UserQueryDto): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log('Fetching users with pagination: ' + JSON.stringify(query));
    return this.usersService.findAll(query);
  }

  @Get('profile')
  @RequirePermissions() // No specific permission required - any authenticated user can view their own profile
  @ApiOperation({
    summary: 'Lấy thông tin profile của user hiện tại',
    description: 'Lấy thông tin profile của user đang đăng nhập. Không yêu cầu permission đặc biệt.'
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin profile',
    type: UserResponseDto,
  })
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    this.logger.log(`Fetching profile for user: ${req.user.id}`);
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @RequirePermissions('users.view')
  @ApiOperation({
    summary: 'Lấy thông tin user theo ID',
    description: 'Lấy thông tin chi tiết của user. Yêu cầu permission: users.view'
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin user',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.view',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    this.logger.log(`Fetching user: ${id}`);
    return this.usersService.findOne(id);
  }

  @Get(':id/roles')
  @RequirePermissions('users.view', 'roles.view')
  @ApiOperation({
    summary: 'Lấy thông tin user kèm roles',
    description: 'Lấy thông tin user kèm danh sách roles. Yêu cầu permission: users.view hoặc roles.view'
  })
  @ApiResponse({
    status: 200,
    description: 'User với danh sách roles',
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.view hoặc roles.view',
  })
  async getUserWithRoles(@Param('id') id: string) {
    this.logger.log(`Fetching user with roles: ${id}`);
    return this.usersService.findOneWithRoles(id);
  }

  @Get(':id/permissions')
  @RequirePermissions('users.view', 'permissions.view')
  @ApiOperation({
    summary: 'Lấy thông tin user kèm permissions',
    description: 'Lấy thông tin user kèm tất cả permissions từ các roles. Yêu cầu permission: users.view hoặc permissions.view'
  })
  @ApiResponse({
    status: 200,
    description: 'User với danh sách permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.view hoặc permissions.view',
  })
  async getUserWithPermissions(@Param('id') id: string) {
    this.logger.log(`Fetching user with permissions: ${id}`);
    return this.usersService.findOneWithPermissions(id);
  }

  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({
    summary: 'Tạo user mới',
    description: 'Tạo user mới. Yêu cầu permission: users.create'
  })
  @ApiResponse({
    status: 201,
    description: 'User đã được tạo thành công',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email hoặc username đã tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.create',
  })
  async create(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    this.logger.log(`Creating new user: ${registerDto.email}`);
    const user = await this.usersService.create(registerDto);
    return this.usersService.findOne(user.id);
  }

  @Put('reset-password')
  @RequirePermissions('users.reset_password')
  @ApiOperation({
    summary: 'Reset password về mặc định',
    description: 'Reset password của user về mật khẩu mặc định (username hoặc config). Yêu cầu permission: users.reset_password'
  })
  @ApiResponse({
    status: 200,
    description: 'Password đã được reset thành công',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.reset_password',
  })
  async resetPassword(
    @Body() body: { username: string },
  ): Promise<UserResponseDto> {
    this.logger.log(`Resetting password for user: ${body.username}`);
    return this.usersService.resetPassword(body.username);
  }

  @Put(':id')
  @RequirePermissions('users.edit')
  @ApiOperation({
    summary: 'Cập nhật thông tin user',
    description: 'Cập nhật thông tin user. Yêu cầu permission: users.edit'
  })
  @ApiResponse({
    status: 200,
    description: 'User đã được cập nhật thành công',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.edit',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${id}`);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({
    summary: 'Xóa user',
    description: 'Xóa user khỏi hệ thống. Yêu cầu permission: users.delete'
  })
  @ApiResponse({
    status: 200,
    description: 'User đã được xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.delete',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting user: ${id}`);
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Put('change-password')
  @RequirePermissions() // Any authenticated user can change their own password
  @ApiOperation({
    summary: 'Đổi password',
    description: 'Đổi password của user. User cần nhập password cũ để xác thực. Không yêu cầu permission đặc biệt.'
  })
  @ApiResponse({
    status: 200,
    description: 'Password đã được đổi thành công',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Password cũ không đúng',
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  async changePassword(
    @Body() body: { username: string; oldPassword: string; newPassword: string },
  ): Promise<UserResponseDto> {
    this.logger.log(`Changing password for user: ${body.username}`);
    return this.usersService.changePassword(body.username, body.oldPassword, body.newPassword);
  }

  @Put(':id/change-status')
  @RequirePermissions('users.activate', 'users.deactivate')
  @ApiOperation({
    summary: 'Thay đổi trạng thái tài khoản',
    description: 'Kích hoạt hoặc vô hiệu hóa tài khoản user. Yêu cầu permission: users.activate hoặc users.deactivate'
  })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái đã được thay đổi thành công',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền users.activate hoặc users.deactivate',
  })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ): Promise<UserResponseDto> {
    this.logger.log(`Changing status for user: ${id}`);
    return this.usersService.changeStatus(id, body.isActive);
  }
}
