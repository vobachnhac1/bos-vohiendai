import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import { AssignRoleDto, AssignMultipleRolesDto } from '../dto/assign-role.dto';
import { RolesService } from './roles.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) { }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<UserRole> {
    const { userId, roleId, assignedBy } = assignRoleDto;

    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Verify role exists 
    const role = await this.rolesService.findOne(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    // Verify assignedBy user exists (if provided)
    if (assignedBy) {
      await this.usersService.findOne(assignedBy);
    }

    // Check if already assigned
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (existing) {
      throw new ConflictException('Role already assigned to this user');
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
      assignedBy,
    });

    return this.userRoleRepository.save(userRole);
  }

  async assignMultipleRoles(dto: AssignMultipleRolesDto): Promise<UserRole[]> {
    const { userId, roleIds, assignedBy } = dto;
    // Verify user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // kiểm tra roleIds exist
    const roles = await this.rolesService.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }
    if (assignedBy) {
      // lấy danh sách userRoles của user
      const existingGrantedBy = await this.userRoleRepository.find({
        where: { userId, assignedBy: assignedBy?.toString() },
      });
      if (existingGrantedBy.length > 0) {
        // xoá những role không thuộc roleIds  
        const existingRemove = existingGrantedBy.filter(ur => !roleIds.includes(ur.roleId));
        await this.userRoleRepository.remove(existingRemove);
        // danh sách đã tồn tại 
        const existingRoleIds = existingGrantedBy.map(ur => ur.roleId);
        // thêm những roles mới
        const newRoleIds = roleIds.filter(id => !existingRoleIds.includes(id));
        const userRoles = newRoleIds.map(roleId =>
          this.userRoleRepository.create({
            userId,
            roleId,
            assignedBy,
          })
        );
        await this.userRoleRepository.save(userRoles);
      } else {
        const userRoles = roleIds.map(roleId =>
          this.userRoleRepository.create({
            userId,
            roleId,
            assignedBy,
          })
        );
        await this.userRoleRepository.save(userRoles);
      }
      return this.userRoleRepository.find({
        where: { userId, assignedBy: assignedBy?.toString() },
      });
    } else {
      const existing = await this.userRoleRepository.find({
        where: { userId, assignedBy: null },
      });
      if (existing.length > 0) {
        // xoá những role không thuộc roleIds  
        const existingRemove = existing.filter(ur => !roleIds.includes(ur.roleId));
        await this.userRoleRepository.remove(existingRemove);
        // danh sách đã tồn tại 
        const existingRoleIds = existing.filter(ur => roleIds.includes(ur.roleId))?.map(ur => ur.roleId) ?? [];
        // thêm những roles mới
        const newRoleIds = roleIds.filter(id => !existingRoleIds.includes(id));
        const userRoles = newRoleIds.map(roleId =>
          this.userRoleRepository.create({
            userId,
            roleId,
          })
        );
        await this.userRoleRepository.save(userRoles);
      } else {
        const userRoles = roleIds.map(roleId =>
          this.userRoleRepository.create({
            userId,
            roleId,
          })
        );
        await this.userRoleRepository.save(userRoles);
      }
      return this.userRoleRepository.find({
        where: { userId },
      });
    }
  }

  async removeRole(userId: string, roleId: number): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.userRoleRepository.remove(userRole);
  }

  async removeAllRolesFromUser(userId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId });
  }

  async getRolesByUser(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });
  }

  async getUsersByRole(roleId: number): Promise<UserRole[]> {
    await this.rolesService.findOne(roleId); // Verify role exists

    return this.userRoleRepository.find({
      where: { roleId },
      relations: ['user'],
    });
  }

  async syncUserRoles(userId: string, roleIds: number[], assignedBy?: string): Promise<UserRole[]> {
    // Remove all existing roles
    await this.userRoleRepository.delete({ userId });

    // Add new roles
    if (roleIds.length === 0) {
      return [];
    }

    // Verify all roles exist
    await Promise.all(roleIds.map(id => this.rolesService.findOne(id)));

    const userRoles = roleIds.map(roleId =>
      this.userRoleRepository.create({
        userId,
        roleId,
        assignedBy,
      })
    );

    return this.userRoleRepository.save(userRoles);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    const permissions = new Set<string>();

    userRoles.forEach(userRole => {
      userRole.role.rolePermissions?.forEach(rp => {
        if (rp.permission) {
          permissions.add(rp.permission.code);
        }
      });
    });

    return Array.from(permissions);
  }

  async checkUserPermission(userId: string, permissionCode: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionCode);
  }

  // Xoá user roles theo userId 
  async removeUserRoles(userId: string): Promise<any> {
    // kiểm tra user roles tồn tại theo userId 
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });
    if(userRoles.length > 0){
      let reDelUserRoles =  await this.userRoleRepository.delete({ userId });
      if(reDelUserRoles.affected > 0){
        return true;
      }else{
        return false;
      }
    }else{
      return true;
    }
  }
}

