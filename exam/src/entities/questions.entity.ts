import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany, Unique, }
    from 'typeorm'; import { QuestionGroup } from './question-groups.entity'; import { UserAnswer }
    from './user-answers.entity'; import { Part } from './parts.entity'; @Entity('questions') @Unique('uq_question_order', ['questionGroup', 'questionOrder'])
export class Question {
    @PrimaryGeneratedColumn('uuid') id: string; @Index('idx_questions_group_id')
    @ManyToOne(() => QuestionGroup, (questionGroup) => questionGroup.questions, { onDelete: 'CASCADE', })
    @JoinColumn({ name: 'question_group_id' }) questionGroup: QuestionGroup;
    @ManyToOne(() => Part, (part) => part.questions, { onDelete: 'CASCADE', })
    @JoinColumn({ name: 'part_id' }) part: Part;
    @Column({ name: "part_id", type: 'uuid', nullable: true }) partId: string; @Index('idx_questions_type')
    @Column({ type: 'varchar', length: 30 }) type: string; @Column({ type: 'text' }) content: string;
    @Column({ type: 'text', nullable: true }) explanation: string;
    @Column({ name: 'audio_url', type: 'text', nullable: true }) audioUrl: string;
    @Column({ name: 'image_url', type: 'text', nullable: true }) imageUrl: string;
    @Index('idx_questions_options_gin', { synchronize: false })
    @Column({ type: 'json', nullable: true }) options: object;
    @Column({ name: 'correct_option', type: 'json', nullable: true }) correctOption: object;
    @Column({ type: 'int', default: 1 }) score: number;
    @Column({ name: 'question_order', type: 'int' }) questionOrder: number;
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date; @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date; @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.question) userAnswers: UserAnswer[];
}