import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { StaffCertificate } from 'src/modules/staff/entities/staff-certificate.entity'

@Entity({ name: 'certificate' })
@Index('idx_certificate_code', ['code'])
@Index('idx_certificate_event_date', ['eventDate'])
export class Certificate {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate?: Date;

  @Column({ name: 'content', type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'certificate_type', type: 'varchar', length: 100, nullable: true })
  certificateType?: string;

  @Column({ name: 'level', type: 'varchar', length: 100, nullable: true })
  level?: string;

  @Column({ name: 'organizer', type: 'varchar', length: 255, nullable: true })
  organizer?: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ name: 'contact_info', type: 'text', nullable: true })
  contactInfo?: string;

  @Column({ name: 'valid_from', type: 'date', nullable: true })
  validFrom?: Date;

  @Column({ name: 'valid_to', type: 'date', nullable: true })
  validTo?: Date;

  @Column({ name: 'attachment_url', type: 'varchar', length: 500, nullable: true })
  attachmentUrl?: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status: boolean; // 1: dùng, 0: ngưng

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
  @OneToMany(() => StaffCertificate, (sc) => sc.certificate)
  staffCertificates: StaffCertificate[];
}
