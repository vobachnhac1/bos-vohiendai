import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { UserRolesService } from '../../rbac/services/user-roles.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role?: string; // Legacy field for backward compatibility
  roles?: string[]; // Array of role names
  permissions?: string[]; // Array of permission codes
  type?: 'access' | 'refresh'; // Token type
}

export interface TenantInfo {
  id: string;
  code: string;
  name: string;
  domain?: string;
  status: string;
  plan?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiration in seconds
  user: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    role?: string; // Legacy field
    roles?: string[]; // Array of role names
    permissions: string[]; // Array of permission codes
    tenantIds?: string[]; // Array of tenant IDs
    tenants?: any; // Object
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly ACCESS_TOKEN_EXPIRATION = 3600; // 1 hour in seconds
  private readonly REFRESH_TOKEN_EXPIRATION = 604800; // 7 days in seconds

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userRolesService: UserRolesService,
  ) {}

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      { ...payload, type: 'access' },
      { expiresIn: this.ACCESS_TOKEN_EXPIRATION }
    );
  }

  private generateRefreshToken(payload: Omit<JwtPayload, 'roles' | 'permissions'>): string {
    return this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: this.REFRESH_TOKEN_EXPIRATION }
    );
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log(`Registering new user: ${registerDto.email}`);
    // thêm roles_id
    const user = await this.usersService.create(registerDto);
    
    // Get user roles and permissions
    const userWithRoles = await this.usersService.findOneWithRoles(user.id);
    const permissions = await this.userRolesService.getUserPermissions(user.id);
    const roleNames = userWithRoles.userRoles?.map(ur => ur.role.name) || [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role, // Legacy field
      roles: roleNames,
      permissions: permissions,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRATION,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role, // Legacy field
        roles: roleNames,
        permissions: permissions
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log(`Login attempt for user: ${loginDto.emailOrUsername}`);

    const user = await this.validateUser(loginDto.emailOrUsername, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user's tenants
    // Get user roles and permissions
    const userWithRoles = await this.usersService.findOneWithRoles(user.id);
    const permissions = await this.userRolesService.getUserPermissions(user.id);
    const roleNames = userWithRoles.userRoles?.map(ur => ur.role.name) || [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role, // Legacy field
      roles: roleNames,
      permissions: permissions,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Update last login time
    await this.usersService.update(user.id, { lastLogin: new Date() });
    
    // lấy thông tenant area 
    // const tenantAreas = await this.tenantAreasService.getAreasByTenant(tenantUsers[0].tenantId);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRATION,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role, // Legacy field
        roles: roleNames,
        permissions: permissions
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken) as JwtPayload;

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Get fresh user data
      const user = await this.usersService.findOne(decoded.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Get user roles and permissions
      const userWithRoles = await this.usersService.findOneWithRoles(user.id);
      const permissions = await this.userRolesService.getUserPermissions(user.id);
      const roleNames = userWithRoles.userRoles?.map(ur => ur.role.name) || [];

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        roles: roleNames,
        permissions: permissions,
      };

      const newAccessToken = this.generateAccessToken(payload);
      const newRefreshToken = this.generateRefreshToken({
        sub: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.ACCESS_TOKEN_EXPIRATION,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          roles: roleNames,
          permissions: permissions,
        },
      };
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(emailOrUsername: string, password: string): Promise<User | null> {
    // Try to find user by email first, then by username
    let user = await this.usersService.findByEmail(emailOrUsername);
    if (!user) {
      user = await this.usersService.findByUsername(emailOrUsername);
    }
    if (user && await this.usersService.validatePassword(user, password)) {
      return user;
    }

    return null;
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
