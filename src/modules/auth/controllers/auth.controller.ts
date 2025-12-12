import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, AuthResponse } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UsersService } from '../../users/services/users.service';
import { UserRolesService } from '../../rbac/services/user-roles.service';

@ApiTags('Authentication - Quản lý xác thực')
@Controller('auth')
export class AuthController {

  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản người dùng mới. Sau khi đăng ký thành công, user sẽ nhận được access token và thông tin user bao gồm roles và permissions.'
  })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', example: 'john@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user', description: 'Legacy field' },
            roles: { type: 'array', items: { type: 'string' }, example: ['viewer', 'operator'] },
            permissions: { type: 'array', items: { type: 'string' }, example: ['devices.view', 'devices.edit'] }
          }
        },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        expiresIn: { type: 'number', example: 3600, description: 'Access token expiration in seconds' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Email hoặc username đã tồn tại',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log(`Registration request for email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập',
    description: 'Đăng nhập bằng email/username và password. Trả về access token và thông tin user bao gồm roles và permissions.'
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', example: 'john@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user', description: 'Legacy field' },
            roles: { type: 'array', items: { type: 'string' }, example: ['viewer', 'operator'] },
            permissions: { type: 'array', items: { type: 'string' }, example: ['devices.view', 'devices.edit'] }
          }
        },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        expiresIn: { type: 'number', example: 3600, description: 'Access token expiration in seconds' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Email/username hoặc password không đúng',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log(`Login request for: ${loginDto.emailOrUsername}`);
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Sử dụng refresh token để lấy access token mới. Refresh token có thời hạn 7 ngày.'
  })
  @ApiResponse({
    status: 200,
    description: 'Token đã được refresh thành công',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        expiresIn: { type: 'number', example: 3600 },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', example: 'john@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user' },
            roles: { type: 'array', items: { type: 'string' }, example: ['viewer', 'operator'] },
            permissions: { type: 'array', items: { type: 'string' }, example: ['devices.view', 'devices.edit'] }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    this.logger.log('Refresh token request');
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lấy thông tin user hiện tại',
    description: 'Lấy thông tin đầy đủ của user từ JWT token, bao gồm roles và permissions mới nhất từ database.'
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin user hiện tại',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1' },
        username: { type: 'string', example: 'john_doe' },
        email: { type: 'string', example: 'john@example.com' },
        fullName: { type: 'string', example: 'John Doe' },
        role: { type: 'string', example: 'user', description: 'Legacy field' },
        isActive: { type: 'boolean', example: true },
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'viewer' },
              description: { type: 'string', example: 'View only access' }
            }
          }
        },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: ['devices.view', 'devices.edit', 'users.view']
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token không hợp lệ hoặc đã hết hạn',
  })
  async getMe(@Request() req: any) {
    this.logger.log(`Get current user info: ${req.user.id}`);

    // Get fresh user data from database
    const user = await this.usersService.findOne(req.user.id);

    // Get user roles with full details
    const userWithRoles = await this.usersService.findOneWithRoles(user.id);

    // Get all permissions
    const permissions = await this.userRolesService.getUserPermissions(user.id);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role, // Legacy field
      isActive: user.isActive,
      roles: userWithRoles.userRoles?.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })) || [],
      permissions: permissions,
      tenantIds: (user as any).tenantIds || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng xuất',
    description: 'Đăng xuất khỏi hệ thống. Note: JWT token vẫn còn hiệu lực cho đến khi hết hạn, client cần xóa token ở phía mình.'
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  async logout(@Request() req: any) {
    this.logger.log(`Logout request from user: ${req.user.id}`);
    // Note: With JWT, we can't invalidate tokens on server side
    // Client should remove the token from storage
    return { message: 'Logged out successfully' };
  }
}
