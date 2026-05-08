import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Exam } from './exams.entity';
import { QuestionGroup } from './question-groups.entity';

@Entity('parts')
@Unique('uq_part_order', ['exam', 'partOrder'])
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @Index('idx_parts_exam_id')
  @ManyToOne(() => Exam, (exam) => exam.parts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  type: string;

  @Column({ name: 'part_order', type: 'int' })
  partOrder: number;

  @Column({ type: 'text', nullable: true })
  instruction: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => QuestionGroup, (questionGroup) => questionGroup.part)
  questionGroups: QuestionGroup[];
}
