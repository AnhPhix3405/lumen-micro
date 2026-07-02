import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmitsController } from './submits.controller';
import { SubmitsService } from './submits.service';
import { Submit } from 'src/entities/submits.entity';
import { Exam } from 'src/entities/exams.entity';
import { UserAnswer } from 'src/entities/user-answers.entity';
import { Part } from 'src/entities/parts.entity';
import { Question } from 'src/entities/questions.entity';
import { QuestionTopic } from 'src/entities/question-topic.entity';
import { Topic } from 'src/entities/topic.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Submit, Exam, Part, Question, UserAnswer, QuestionTopic, Topic])],
    controllers: [SubmitsController],
    providers: [SubmitsService],
})
export class SubmitsModule {}
