import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Submit } from './submits.entity';
import { Question } from './questions.entity';

@Entity('user_answers')
@Unique('uq_submit_question', ['submit', 'question'])
export class UserAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_user_answers_submit_id')
  @ManyToOne(() => Submit, (submit) => submit.userAnswers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submit_id' })
  submit: Submit;

  @Index('idx_user_answers_question_id')
  @ManyToOne(() => Question, (question) => question.userAnswers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'answer_type', type: 'varchar', length: 30 })
  answerType: string;

  @Column({ name: 'selected_option', type: 'json', nullable: true })
  selectedOption: object | null;

  @Column({ name: 'answer_content', type: 'text', nullable: true })
  answerContent: string | null;

  @Column({ name: 'audio_url', type: 'text', nullable: true })
  audioUrl: string | null;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  score: number;

  @Column({ name: 'answered_at', type: 'datetime', default: () => 'NOW()' })
  answeredAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
