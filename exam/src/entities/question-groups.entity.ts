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
import { Part } from './parts.entity';
import { Question } from './questions.entity';

@Entity('question_groups')
@Unique('uq_question_group_order', ['part', 'groupOrder'])
export class QuestionGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_question_groups_part_id')
  @ManyToOne(() => Part, (part) => part.questionGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: Part;

  @Column({ name: 'part_id', type: 'uuid' })
  partId: string;


  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'type', type: 'varchar', nullable: true })
  type: string;

  @Column({ name: 'audio_url', type: 'text', nullable: true })
  audioUrl: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  transcript: string;

  @Column({ name: 'group_order', type: 'int' })
  groupOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.questionGroup)
  questions: Question[];
}
