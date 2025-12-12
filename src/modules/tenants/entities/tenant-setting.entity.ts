import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_settings')
@Index(['tenantId', 'settingKey'], { unique: true })
export class TenantSetting {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 100, name: 'setting_key' })
  settingKey: string;

  @Column({ type: 'text', nullable: true, name: 'setting_value' })
  settingValue?: string;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.settings)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}

