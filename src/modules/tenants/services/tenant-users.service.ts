import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantUser, TenantUserStatus } from '../entities/tenant-user.entity';
import { AddTenantUserDto } from '../dto/add-tenant-user.dto';

@Injectable()
export class TenantUsersService {
  private readonly logger = new Logger(TenantUsersService.name);

  constructor(
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
  ) {}

  /**
   * Add user to tenant
   */
  async addUserToTenant(tenantId: string, addUserDto: AddTenantUserDto, currentUserId?: string): Promise<TenantUser> {
    try {
      // Check if user already exists in tenant
      const existing = await this.tenantUserRepository.findOne({
        where: {
          tenantId,
          userId: addUserDto.userId,
        },
      });

      if (existing) {
        throw new ConflictException('User already exists in this tenant');
      }

      const tenantUser = this.tenantUserRepository.create({
        tenantId,
        userId: addUserDto.userId,
        status: addUserDto.status || TenantUserStatus.ACTIVE,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });

      const saved = await this.tenantUserRepository.save(tenantUser);
      this.logger.log(`Added user ${addUserDto.userId} to tenant ${tenantId} by user ${currentUserId || 'system'}`);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to add user to tenant: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all users in a tenant
   */
  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    return await this.tenantUserRepository.find({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all tenants for a user
   */
  async getUserTenants(userId: string): Promise<TenantUser[]> {
    // add tenant areas
    // relations: ['tenant', 'tenant.tenantAreas', 'tenant.tenantAreas.area'],
    return await this.tenantUserRepository.find({
      where: { userId, status: TenantUserStatus.ACTIVE },
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if user has access to tenant
   */
  async hasAccess(userId: string, tenantId: string): Promise<boolean> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId,
        tenantId,
        status: TenantUserStatus.ACTIVE,
      },
    });

    return !!tenantUser;
  }


  /**
   * Remove user from tenant
   */
  async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { tenantId, userId },
    });

    if (!tenantUser) {
      throw new NotFoundException('User not found in tenant');
    }

    await this.tenantUserRepository.remove(tenantUser);
    this.logger.log(`Removed user ${userId} from tenant ${tenantId}`);
  }

  /**
   * Get user's tenant IDs (for filtering queries)
   */
  async getUserTenantIds(userId: string): Promise<string[]> {
    const tenantUsers = await this.tenantUserRepository.find({
      where: { userId, status: TenantUserStatus.ACTIVE },
      select: ['tenantId'],
    });

    return tenantUsers.map(tu => tu.tenantId);
  }
}

