import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { StaffContact } from './staff-contact.entity';
import { StaffCertificate } from './staff-certificate.entity';

export enum Gender {
  FEMALE = 0,
  MALE = 1,
  OTHER = 2,
}

export enum StaffStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  TEMPORARY_STOP = 2,
}

@Entity({ name: 'staff' })
@Index('idx_staff_tenant', ['tenantId'])
@Index('idx_staff_phone', ['phone'])
@Index('idx_staff_status', ['status'])
export class Staff {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'tenant_id', type: 'bigint' })
  tenantId: number;

//   @ManyToOne(() => Tenant, (tenant) => tenant.staffs, { onDelete: 'NO ACTION' })
//   tenant: Tenant;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({
    name: 'gender',
    type: 'int',
    nullable: true,
  })
  gender?: Gender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'id_number', type: 'varchar', length: 50, nullable: true })
  idNumber?: string;

  @Column({ name: 'position', type: 'varchar', length: 150, nullable: true })
  position?: string;

  @Column({ name: 'staff_type', type: 'varchar', length: 100, nullable: true })
  staffType?: string;

  @Column({ name: 'join_date', type: 'date', nullable: true })
  joinDate?: Date;

  @Column({ name: 'leave_date', type: 'date', nullable: true })
  leaveDate?: Date;

  @Column({
    name: 'status',
    type: 'int',
    default: StaffStatus.ACTIVE,
  })
  status: StaffStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy?: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy?: number;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  // Relations
  @OneToMany(() => StaffContact, (contact) => contact.staff)
  contacts: StaffContact[];

  @OneToMany(() => StaffCertificate, (sc) => sc.staff)
  staffCertificates: StaffCertificate[];
}
