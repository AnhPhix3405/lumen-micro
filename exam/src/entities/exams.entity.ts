import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Part } from './parts.entity';
import { Submit } from './submits.entity';
import { ExamType } from './exam-types.entity';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'total_score', type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'varchar', length: 20, default: 'private' })
  visibility: string;

  @Index('idx_exams_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'exam_type_id', type: 'uuid' })
  examTypeId: string;

  @Index('idx_exams_exam_type_id')
  @ManyToOne(() => ExamType, (examType) => examType.exams, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'exam_type_id' })
  examType: ExamType;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime' })
  deletedAt: Date;

  @OneToMany(() => Part, (part) => part.exam)
  parts: Part[];

  @OneToMany(() => Submit, (submit) => submit.exam)
  submits: Submit[];
}
