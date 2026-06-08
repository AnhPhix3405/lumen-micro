import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmitsController } from './submits.controller';
import { SubmitsService } from './submits.service';
import { Submit } from 'src/entities/submits.entity';
import { Exam } from 'src/entities/exams.entity';
import { UserAnswer } from 'src/entities/user-answers.entity';
import { Part } from 'src/entities/parts.entity';
import { Question } from 'src/entities/questions.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Submit, Exam, Part, Question, UserAnswer])],
    controllers: [SubmitsController],
    providers: [SubmitsService],
})
export class SubmitsModule {}
