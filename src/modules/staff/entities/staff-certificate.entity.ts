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
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';

@Entity({ name: 'staff_certificate' })
@Index('idx_sc_staff', ['staffId'])
@Index('idx_sc_certificate', ['certificateId'])
@Index('idx_sc_staff_certificate', ['staffId', 'certificateId'])
export class StaffCertificate {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'staff_id', type: 'bigint' })
  staffId: number;

  @ManyToOne(() => Staff, (staff) => staff.staffCertificates, {
    onDelete: 'CASCADE',
  })
  staff: Staff;

  @Column({ name: 'certificate_id', type: 'bigint' })
  certificateId: number;

  @ManyToOne(
    () => Certificate,
    (certificate) => certificate.staffCertificates,
    { onDelete: 'CASCADE' },
  )
  certificate: Certificate;

  @Column({
    name: 'achievement_status',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  achievementStatus?: string; // Đạt, Không đạt, Giỏi, Khá,...

  @Column({ name: 'score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  score?: number;

  @Column({ name: 'rank', type: 'varchar', length: 100, nullable: true })
  rank?: string;

  @Column({ name: 'certificate_no', type: 'varchar', length: 100, nullable: true })
  certificateNo?: string;

  @Column({ name: 'issued_date', type: 'date', nullable: true })
  issuedDate?: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'issued_by', type: 'varchar', length: 255, nullable: true })
  issuedBy?: string;

  @Column({ name: 'details', type: 'text', nullable: true })
  details?: string;

  @Column({ name: 'attachment_url', type: 'varchar', length: 500, nullable: true })
  attachmentUrl?: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status: boolean; // 1: còn hiệu lực, 0: hết hiệu lực

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
