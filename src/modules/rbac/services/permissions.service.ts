import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionQueryDto } from '../dto/permission-query.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission code already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existingPermission) {
      throw new ConflictException(`Permission with code '${createPermissionDto.code}' already exists`);
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(query: PermissionQueryDto): Promise<{
    permissions: Permission[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 1000,
      code,
    } = query;

    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    // Apply filters
    if (code) {
      queryBuilder.andWhere('permission.code ILIKE :code', { code: `%${code}%` });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const permissions = await queryBuilder
      .orderBy('permission.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      permissions,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { code },
    });
  }

  async findByIds(ids: number[]): Promise<Permission[]> {
    return this.permissionRepository.findByIds(ids);
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // Check if new code conflicts with existing permission
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });

      if (existingPermission) {
        throw new ConflictException(`Permission with code '${updatePermissionDto.code}' already exists`);
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async getPermissionWithRoles(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.role'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }
}

