import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamModule } from './exams/exams.module';
import { QuestionsModule } from './questions/questions.module';
import { PartsModule } from './parts/parts.module';
import { QuestionGroupModule } from './question_groups/question_groups.module';
import { SubmitsModule } from './submits/submits.module';
import { TopicsModule } from './topics/topics.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    TopicsModule,
    ExamModule,
    QuestionsModule,
    PartsModule,
    QuestionGroupModule,
    SubmitsModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: configService.get<string>('DB_PASSWORD'),
        database: 'lumen',
        schema: "exam_service",
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    })
  ],
})
export class AppModule { }
