import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserRole } from '../../rbac/entities/user-role.entity';
import { TenantUser } from '../../tenants/entities/tenant-user.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 128, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'full_name' })
  fullName?: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 32, nullable: true  })
  role: string;

  @Column({ type: 'varchar', nullable: true, length: 32 })
  phone: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login' })
  lastLogin?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at'
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at'
  })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  // Relations
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => TenantUser, (tenantUser) => tenantUser.user)
  tenantUsers: TenantUser[];
}
