import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSetting } from '../entities/tenant-setting.entity';
import { CreateTenantSettingDto } from '../dto/create-tenant-setting.dto';
import { UpdateTenantSettingDto } from '../dto/update-tenant-setting.dto';

@Injectable()
export class TenantSettingsService {
  private readonly logger = new Logger(TenantSettingsService.name);

  constructor(
    @InjectRepository(TenantSetting)
    private readonly tenantSettingRepository: Repository<TenantSetting>,
  ) {}

  /**
   * Create a new tenant setting
   */
  async create(tenantId: string, dto: CreateTenantSettingDto): Promise<TenantSetting> {
    try {
      // Check if setting key already exists for this tenant
      const existing = await this.tenantSettingRepository.findOne({
        where: {
          tenantId,
          settingKey: dto.settingKey,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Setting key '${dto.settingKey}' already exists for tenant ${tenantId}`,
        );
      }

      const setting = this.tenantSettingRepository.create({
        tenantId,
        settingKey: dto.settingKey,
        settingValue: dto.settingValue,
      });

      const saved = await this.tenantSettingRepository.save(setting);
      this.logger.log(`Created setting '${dto.settingKey}' for tenant ${tenantId}`);
      return saved;
    } catch (error) {
      this.logger.error(`Failed to create tenant setting: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all settings for a tenant
   */
  async findAll(tenantId: string): Promise<TenantSetting[]> {
    try {
      return await this.tenantSettingRepository.find({
        where: { tenantId },
        order: { settingKey: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get tenant settings: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a specific setting by key
   */
  async findOne(tenantId: string, settingKey: string): Promise<TenantSetting> {
    try {
      const setting = await this.tenantSettingRepository.findOne({
        where: {
          tenantId,
          settingKey,
        },
      });

      if (!setting) {
        throw new NotFoundException(
          `Setting '${settingKey}' not found for tenant ${tenantId}`,
        );
      }

      return setting;
    } catch (error) {
      this.logger.error(`Failed to get tenant setting: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get setting value by key (returns null if not found)
   */
  async getValue(tenantId: string, settingKey: string): Promise<string | null> {
    try {
      const setting = await this.tenantSettingRepository.findOne({
        where: {
          tenantId,
          settingKey,
        },
      });

      return setting?.settingValue || null;
    } catch (error) {
      this.logger.error(`Failed to get setting value: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Update a tenant setting
   */
  async update(
    tenantId: string,
    settingKey: string,
    dto: UpdateTenantSettingDto,
  ): Promise<TenantSetting> {
    try {
      const setting = await this.findOne(tenantId, settingKey);

      if (dto.settingValue !== undefined) {
        setting.settingValue = dto.settingValue;
      }

      const updated = await this.tenantSettingRepository.save(setting);
      this.logger.log(`Updated setting '${settingKey}' for tenant ${tenantId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update tenant setting: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Set or update a setting (upsert)
   */
  async set(tenantId: string, settingKey: string, settingValue: string): Promise<TenantSetting> {
    try {
      const existing = await this.tenantSettingRepository.findOne({
        where: {
          tenantId,
          settingKey,
        },
      });

      if (existing) {
        existing.settingValue = settingValue;
        return await this.tenantSettingRepository.save(existing);
      } else {
        const setting = this.tenantSettingRepository.create({
          tenantId,
          settingKey,
          settingValue,
        });
        return await this.tenantSettingRepository.save(setting);
      }
    } catch (error) {
      this.logger.error(`Failed to set tenant setting: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a tenant setting
   */
  async remove(tenantId: string, settingKey: string): Promise<void> {
    try {
      const result = await this.tenantSettingRepository.delete({
        tenantId,
        settingKey,
      });

      if (result.affected === 0) {
        throw new NotFoundException(
          `Setting '${settingKey}' not found for tenant ${tenantId}`,
        );
      }

      this.logger.log(`Deleted setting '${settingKey}' for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to delete tenant setting: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete all settings for a tenant
   */
  async removeAll(tenantId: string): Promise<void> {
    try {
      await this.tenantSettingRepository.delete({ tenantId });
      this.logger.log(`Deleted all settings for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to delete tenant settings: ${error.message}`, error.stack);
      throw error;
    }
  }
}

