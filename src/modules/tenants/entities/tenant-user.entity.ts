import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from '../../users/entities/user.entity';

export enum TenantUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('tenant_users')
@Index(['tenantId', 'userId'], { unique: true })
@Index(['tenantId'])
@Index(['userId'])
export class TenantUser {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TenantUserStatus.ACTIVE,
  })
  status: TenantUserStatus;

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
  @ManyToOne(() => Tenant, (tenant) => tenant.tenantUsers)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.tenantUsers)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

