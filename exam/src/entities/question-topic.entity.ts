import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Question } from './questions.entity';
import { Topic } from './topic.entity';

@Entity('question_topics')
export class QuestionTopic {
    @PrimaryColumn({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @PrimaryColumn({ name: 'topic_id', type: 'uuid' })
    topicId: string;

    @Index('idx_question_topics_question')
    @ManyToOne(() => Question, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: Question;

    @Index('idx_question_topics_topic')
    @ManyToOne(() => Topic, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'topic_id' })
    topic: Topic;
}
