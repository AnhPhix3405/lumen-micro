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
} from 'typeorm';
import { Exam } from './exams.entity';
import { UserAnswer } from './user-answers.entity';

@Entity('submits')
export class Submit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_submits_exam_id')
  @ManyToOne(() => Exam, (exam) => exam.submits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Index('idx_submits_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index('idx_submits_status')
  @Column({ type: 'varchar', length: 20, default: 'in_progress' })
  status: string;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'NOW()' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ name: 'correct_ratio', type: 'numeric', precision: 5, scale: 2, nullable: true })
  correctRatio: number;

  @Column({ name: 'total_correct', type: 'int', default: 0 })
  totalCorrect: number;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ name: 'total_score', type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalScore: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: object;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.submit)
  userAnswers: UserAnswer[];
}
