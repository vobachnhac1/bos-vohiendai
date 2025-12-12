import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { TenantUser } from './tenant-user.entity';
import { TenantSetting } from './tenant-setting.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum TenantPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
@Index(['code'], { unique: true })
@Index(['status'])
export class Tenant {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // Short code for routing (e.g., 'vung-tau', 'da-nang')

  @Column({ type: 'varchar', length: 255 })
  name: string; // Display name (e.g., 'Vùng Tàu Port Authority')

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain?: string; // Optional custom domain

  @Column({
    type: 'varchar',
    length: 20,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  plan?: TenantPlan; // Service plan

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional tenant metadata

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ type: 'bigint', nullable: true, name: 'created_by' })
  createdBy?: string;

  @Column({ type: 'bigint', nullable: true, name: 'updated_by' })
  updatedBy?: string;

  // Relations
  @OneToMany(() => TenantUser, (tenantUser) => tenantUser.tenant)
  tenantUsers: TenantUser[];

  @OneToMany(() => TenantSetting, (setting) => setting.tenant)
  settings: TenantSetting[];

  // @OneToMany(() => TenantArea, (tenantArea) => tenantArea.tenant)
  // tenantAreas: TenantArea[];
}

