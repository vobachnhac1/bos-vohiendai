import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Staff } from './staff.entity';

@Entity({ name: 'staff_contact' })
@Index('idx_staff_contact_staff', ['staffId'])
@Index('idx_staff_contact_primary', ['staffId', 'isPrimary'])
export class StaffContact {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'staff_id', type: 'bigint' })
  staffId: number;

  @ManyToOne(() => Staff, (staff) => staff.contacts, {
    onDelete: 'CASCADE',
  })
  staff: Staff;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'relationship', type: 'varchar', length: 100, nullable: true })
  relationship?: string;

  @Column({ name: 'contact_address', type: 'text', nullable: true })
  contactAddress?: string;

@Column({ name: 'is_primary', type: 'boolean', default: false })
isPrimary: boolean;
 // 1: liên hệ chính

  @Column({ name: 'status', type: 'boolean', default: true })
  status: boolean; // 1: đang dùng, 0: không dùng

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
}
