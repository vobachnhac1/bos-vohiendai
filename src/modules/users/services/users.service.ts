import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../../auth/dto/register.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { UserRolesService } from '../../rbac/services/user-roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => UserRolesService))
    private readonly userRolesService: UserRolesService,
  ) { }

  async create(registerDto: RegisterDto): Promise<User> {
    // Check if user already exists by email
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if user already exists by username
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }
    // password giống user || hoặc pass mặc định 
    let password = registerDto.password ?? this.config.get('defaultPassword');
    if (this.config.get('PASS_SAME_AS_USERNAME') === 'true') {
      password = registerDto.username;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username: registerDto.username,
      passwordHash: hashedPassword,
      fullName: registerDto.fullName,
      email: registerDto.email,
      role: registerDto.role,
      isActive: registerDto.isActive ?? true,
      meta: registerDto.meta,
    });

    return this.userRepository.save(user);
  }

  async findAll(query: UserQueryDto): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      username,
      email,
      fullName,
      role,
      isActive,
      createdAfter,
      createdBefore,
      hasRecentLogin,
    } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermission')
      .leftJoinAndSelect('rolePermission.permission', 'permission')

    // Apply filters
    if (username) {
      queryBuilder.andWhere('user.username ILIKE :username', { username: `%${username}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (fullName) {
      queryBuilder.andWhere('user.fullName ILIKE :fullName', { fullName: `%${fullName}%` });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (createdAfter) {
      queryBuilder.andWhere('user.createdAt >= :createdAfter', { createdAfter: new Date(createdAfter) });
    }

    if (createdBefore) {
      queryBuilder.andWhere('user.createdAt <= :createdBefore', { createdBefore: new Date(createdBefore) });
    }

    if (hasRecentLogin) {
      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - 30); // Last 30 days
      queryBuilder.andWhere('user.lastLogin > :cutoffTime', { cutoffTime });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const users = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const usersWithRolesAndPermissions = users.map(user => {
      const roles = user.userRoles?.map(ur => ur.role.name) || [];

      const permissionsSet = new Set<string>();
      user.userRoles?.forEach(userRole => {
        userRole.role?.rolePermissions?.forEach(rolePermission => {
          if (rolePermission.permission?.code) {
            permissionsSet.add(rolePermission.permission.code);
          }
        });
      });
      const permissions = Array.from(permissionsSet);

      // Extract tenant IDs
      // Remove sensitive data and relations before transforming
      const { userRoles,  passwordHash, ...userWithoutSensitiveData } = user;
      const userDto = plainToClass(UserResponseDto, userWithoutSensitiveData);
      return {
        ...userDto,
        roles,
        permissions,
      };
    });

    return {
      users: usersWithRolesAndPermissions,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<User> {
    if (!id) {
      throw new NotFoundException('User not found');
    }
    // thêm permisson theo user
    const userWithPermissions = await this.findOneWithPermissions(id);
    if (!userWithPermissions) {
      throw new NotFoundException('User not found');
    }
    delete userWithPermissions.userRoles // không trả về dữ liệu
    return userWithPermissions;
  }

  async findOneWithRoles(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
      select: ['id', 'username', 'email', 'fullName', 'isActive', 'role', 'createdAt', 'lastLogin'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneWithPermissions(id: string): Promise<User & { permissions: string[], roles: string[] }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission', 'tenantUsers'],
      select: ['id', 'username', 'email', 'fullName', 'isActive', 'role', 'createdAt', 'lastLogin'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Extract unique permissions
    const permissions = new Set<string>();
    const roles = new Set<string>();
    user.userRoles?.forEach(userRole => {
      roles.add(userRole.role.name);
      userRole.role?.rolePermissions?.forEach(rp => {
        if (rp.permission) {
          permissions.add(rp.permission.code);
        }
      });
    });

    return {
      ...user,
      permissions: Array.from(permissions),
      roles: Array.from(roles)
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByCondition(condition: any): Promise<User | null> {
    return this.userRepository.findOne(condition);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  // Reset password
  async resetPassword(usernameOrEmail: string, password?: string): Promise<User> {
    // kiểm tra username hoặc email
    const user = await this.findByCondition({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      throw new BadRequestException('User does not exists');
    }
    // pass default 
    const defaultPassword = user.username ?? this.config.get('defaultPassword');
    user.passwordHash = await bcrypt.hash(defaultPassword, 10);
    return await this.userRepository.save(user);
  }

  // Change password
  async changePassword(username: string, oldPassword: string, password: string): Promise<User> {
    const user = await this.findByCondition({
      where: [{ username: username }, { email: username }],
    });
    if (!user) {
      throw new BadRequestException('User does not exists');
    }
    // kiểm tra pass cũ có dúng không
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    user.passwordHash = await bcrypt.hash(password, 10);
    return await this.userRepository.save(user);
  }


  async update(id: string, updateData: any): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException('User does not exists');
    }

    if (updateData.email) {
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }
    // Handle password update
    // if (updateData.password) {
    //   updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
    // }
    // updateData.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException('User does not exists');
    }

    // thực hiện xoá user roles trước
    const reDelUserRoles = await this.userRolesService.removeUserRoles(id);
    if (!reDelUserRoles) {
      throw new BadRequestException('Failed to delete user roles');
    }
    
    // thực hiện xoá user
    const reDelUser = await this.userRepository.delete(id);
    if (reDelUser.affected === 0) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash);
  }

  // change status of account
  async changeStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = isActive;
    return await this.userRepository.save(user);
  }
}
