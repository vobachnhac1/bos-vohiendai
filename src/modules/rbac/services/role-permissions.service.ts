import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { AssignPermissionDto, AssignMultiplePermissionsDto } from '../dto/assign-permission.dto';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) { }

  async assignPermission(assignPermissionDto: AssignPermissionDto): Promise<RolePermission> {
    const { roleId, permissionId, grantedBy } = assignPermissionDto;

    // Verify role exists
    const role = await this.rolesService.findOne(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    // Verify permission exists
    const permission = await this.permissionsService.findOne(permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    // Check if already assigned
    const existing = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (existing) {
      throw new ConflictException('Permission already assigned to this role');
    }

    const rolePermission = this.rolePermissionRepository.create({
      roleId,
      permissionId,
      grantedBy: grantedBy?.toString(),
    });

    return this.rolePermissionRepository.save(rolePermission);
  }

  async assignMultiplePermissions(dto: AssignMultiplePermissionsDto): Promise<RolePermission[]> {
    const { roleId, permissionIds, grantedBy } = dto;
    // 1. Verify role exists
    const role = await this.rolesService.findOne(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    // 2. Verify all permissions exist
    const permissions = await this.permissionsService.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }
    // Get existing assignments not belong to grantedBy
    const existing = await this.rolePermissionRepository.find({
      where: { roleId },
    });

    if (grantedBy) {
      // get exiting assignments belong to grantedBy
      const existingGrantedBy = await this.rolePermissionRepository.find({
        where: { roleId, grantedBy: grantedBy?.toString() },
      });

      if (existingGrantedBy.length > 0 && grantedBy) {
        // xoá những permission không thuộc permissionIds 
        const existingRemove = existingGrantedBy.filter(rp => !permissionIds.includes(rp.permissionId));
        await this.rolePermissionRepository.remove(existingRemove);

        // danh sách permissionId đã tồn tại
        const existingPermission = existingGrantedBy.filter(rp => permissionIds.includes(rp.permissionId));

        // thêm những permission mới
        const newPermissionIds = permissionIds.filter(id => !existingPermission.map(rp => rp.permissionId).includes(id));
        const rolePermissions = newPermissionIds.map(permissionId =>
          this.rolePermissionRepository.create({
            roleId,
            permissionId,
            grantedBy: grantedBy?.toString(),
          })
        );
        return this.rolePermissionRepository.save(rolePermissions);
      } else if (existing.length == 0 && !grantedBy) {
        const rolePermissions = permissionIds.map(permissionId =>
          this.rolePermissionRepository.create({
            roleId,
            permissionId,
            grantedBy: grantedBy?.toString(),
          })
        );
        return this.rolePermissionRepository.save(rolePermissions);
      }
    }

    if (existing.length > 0 && !grantedBy) {
      // remove all existing assignments
      // xoá những permission không thuộc permissionIds 
      const existingRemove = existing.filter(rp => !permissionIds.includes(rp.permissionId));
      await this.rolePermissionRepository.remove(existingRemove);

      // danh sách permissionId đã tồn tại
      const existingPermission = existing.filter(rp => permissionIds.includes(rp.permissionId));

      // thêm những permission mới
      const newPermissionIds = permissionIds.filter(id => !existingPermission.map(rp => rp.permissionId).includes(id));
      const rolePermissions = newPermissionIds.map(permissionId =>
        this.rolePermissionRepository.create({
          roleId,
          permissionId,
          grantedBy: grantedBy?.toString(),
        })
      );

      return this.rolePermissionRepository.save(rolePermissions);
    } else if (existing.length == 0 && !grantedBy) {
      // thêm mới role_permission với grantedBy = null
      const rolePermissions = permissionIds.map(permissionId =>
        this.rolePermissionRepository.create({
          roleId,
          permissionId,
        })
      );
      return this.rolePermissionRepository.save(rolePermissions);
    }

    // Create new assignments
    const rolePermissions = permissionIds.map(permissionId =>
      this.rolePermissionRepository.create({
        roleId,
        permissionId,
        grantedBy: grantedBy?.toString(),
      })
    );

    if (rolePermissions.length === 0) {
      throw new ConflictException('All permissions are already assigned to this role');
    }
    return this.rolePermissionRepository.save(rolePermissions);
  }

  async removePermission(roleId: number, permissionId: number): Promise<any> {
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (!rolePermission) {
      throw new NotFoundException('Permission assignment not found');
    }
   return await this.rolePermissionRepository.remove(rolePermission);
  }

  async removeAllPermissionsFromRole(roleId: number): Promise<any> {
    const role = await this.rolesService.findOne(roleId); // Verify role exists
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return await this.rolePermissionRepository.delete({ roleId });
  }

  async getPermissionsByRole(roleId: number): Promise<RolePermission[]> {
    const role = await this.rolesService.findOne(roleId); // Verify role exists
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
  }

  async getRolesByPermission(permissionId: number): Promise<RolePermission[]> {
    const permission = await this.permissionsService.findOne(permissionId); // Verify permission exists
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return this.rolePermissionRepository.find({
      where: { permissionId },
      relations: ['role'],
    });
  }

  async syncRolePermissions(roleId: number, permissionIds: number[], grantedBy?: number): Promise<RolePermission[]> {
    const role = await this.rolesService.findOne(roleId); // Verify role exists
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    // Remove all existing permissions
    const existing = await this.rolePermissionRepository.delete({ roleId });
    // Add new permissions
    if (permissionIds.length === 0) {
      return [];
    }

    // Verify all permissions exist
    const permissions = await this.permissionsService.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    const rolePermissions = permissionIds.map(permissionId =>
      this.rolePermissionRepository.create({
        roleId,
        permissionId,
        grantedBy: grantedBy?.toString(),
      })
    );

    return this.rolePermissionRepository.save(rolePermissions);
  }
}

