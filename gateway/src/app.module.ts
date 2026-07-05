import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { ExamController } from './exam.controller';
import { AdminExamController } from './admin-exam.controller';
import { QuestionController } from './exams/question.controller';
import { PartController } from './exams/part.controller';
import { QuestionGroupController } from './exams/question-group.controller';
import { SessionController } from './exams/session.controller';
import { TopicController } from './exams/topic.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  })],
  controllers: [
    AuthController,
    UserController,
    ExamController,
    AdminExamController,
    PartController,
    QuestionGroupController,
    SessionController,
    QuestionController,
    TopicController,
  ],
  providers: [
    AuthController,
    UserController,
    ExamController,
    AdminExamController,
    PartController,
    QuestionGroupController,
    SessionController,
    QuestionController,
    TopicController,
  ],
})
export class AppModule { }
