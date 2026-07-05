import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { Topic } from 'src/entities/topic.entity';
import { QuestionTopic } from 'src/entities/question-topic.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Topic, QuestionTopic])],
    controllers: [TopicsController],
    providers: [TopicsService],
})
export class TopicsModule {}
