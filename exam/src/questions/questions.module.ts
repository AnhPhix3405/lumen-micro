import { Module } from "@nestjs/common";
import { QuestionsController } from "./questions.controller";
import { QuestionsService } from "./questions.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Question } from "src/entities/questions.entity";
import { QuestionGroup } from "src/entities/question-groups.entity";
import { Part } from "src/entities/parts.entity";
import { Exam } from "src/entities/exams.entity";
import { UploadService } from "src/services/upload.service";

@Module({
    imports: [TypeOrmModule.forFeature([Question, QuestionGroup, Part, Exam])],
    controllers: [QuestionsController],
    providers: [QuestionsService, UploadService]
})
export class QuestionsModule { }
