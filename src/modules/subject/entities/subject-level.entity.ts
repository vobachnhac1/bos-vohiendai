import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Subject } from './subject.entity';

@Entity({ name: 'rank_level' })
@Index('uq_rank_level_subject_code', ['subjectId', 'code'], { unique: true })
@Index('uq_rank_level_subject_order', ['subjectId', 'orderIndex'], { unique: true })
export class SubjectLevel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'subject_id', type: 'bigint' })
  subjectId: number;

  @ManyToOne(() => Subject, (subject) => subject.subjectLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ type: 'varchar', length: 50 })
  code: string; // mã: GREEN, YELLOW, BLACK_1...

  @Column({ type: 'varchar', length: 255 })
  name: string; // tên hiển thị: Xanh lá, Vàng, Đen cấp 1

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string; // màu đai (tùy chọn)

  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number; // thứ tự tăng dần (1: thấp nhất)

  @Column({ name: 'min_training_months', type: 'int', nullable: true })
  minTrainingMonths?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  status: boolean; // true: active, false: inactive

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
