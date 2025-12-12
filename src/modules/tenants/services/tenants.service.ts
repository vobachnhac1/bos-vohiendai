import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { TenantUser } from '../entities/tenant-user.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantQueryDto } from '../dto/tenant-query.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
  ) {}

  /**
   * Create a new tenant
   */
  async create(createTenantDto: CreateTenantDto, userId?: string): Promise<Tenant> {
    try {
      // Check if code already exists
      const existing = await this.tenantRepository.findOne({
        where: { code: createTenantDto.code },
      });

      if (existing) {
        throw new ConflictException(`Tenant with code '${createTenantDto.code}' already exists`);
      }

      const tenant = this.tenantRepository.create({
        ...createTenantDto,
        status: createTenantDto.status || TenantStatus.ACTIVE,
        createdBy: userId,
        updatedBy: userId,
      });

      const saved = await this.tenantRepository.save(tenant);
      this.logger.log(`Created tenant: ${saved.name} (${saved.code}) by user ${userId || 'system'}`);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create tenant: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all tenants with pagination and filtering
   */
  async findAll(query: TenantQueryDto): Promise<{
    tenants: Tenant[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { page = 1, limit = 20, search, status, plan } = query;

      const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');

      // Apply filters
      if (search) {
        queryBuilder.andWhere(
          '(LOWER(tenant.code) LIKE LOWER(:search) OR LOWER(tenant.name) LIKE LOWER(:search))',
          { search: `%${search}%` },
        );
      }

      if (status) {
        queryBuilder.andWhere('tenant.status = :status', { status });
      }

      if (plan) {
        queryBuilder.andWhere('tenant.plan = :plan', { plan });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const tenants = await queryBuilder
        .orderBy('tenant.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        tenants,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to find tenants: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find one tenant by ID
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['tenantUsers', 'tenantUsers.user'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  /**
   * Find tenant by code
   */
  async findByCode(code: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { code },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with code '${code}' not found`);
    }

    return tenant;
  }

  /**
   * Update a tenant
   */
  async update(id: string, updateTenantDto: UpdateTenantDto, userId?: string): Promise<Tenant> {
    try {
      const tenant = await this.findOne(id);

      // Check if code is being changed and if it conflicts
      if (updateTenantDto.code && updateTenantDto.code !== tenant.code) {
        const existing = await this.tenantRepository.findOne({
          where: { code: updateTenantDto.code },
        });

        if (existing) {
          throw new ConflictException(`Tenant with code '${updateTenantDto.code}' already exists`);
        }
      }

      Object.assign(tenant, updateTenantDto);
      tenant.updatedAt = new Date();
      tenant.updatedBy = userId;

      const updated = await this.tenantRepository.save(tenant);
      this.logger.log(`Updated tenant: ${updated.name} (${updated.code}) by user ${userId || 'system'}`);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update tenant ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a tenant (soft delete by setting status to DELETED)
   */
  async remove(id: string): Promise<void> {
    try {
      const tenant = await this.findOne(id);

      tenant.status = TenantStatus.DELETED;
      tenant.updatedAt = new Date();

      await this.tenantRepository.save(tenant);
      this.logger.log(`Deleted tenant: ${tenant.name} (${tenant.code})`);
    } catch (error) {
      this.logger.error(`Failed to delete tenant ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}

