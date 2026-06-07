import { Module } from "@nestjs/common";
import { QuestionGroupsController } from "./question_groups.controller";
import { QuestionGroupsService } from "./question_groups.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuestionGroup } from "src/entities/question-groups.entity";
import { UploadService } from "src/services/upload.service";
import { PartsService } from "src/parts/parts.service";
import { Exam } from "src/entities/exams.entity";
import { Part } from "src/entities/parts.entity";

@Module({
    imports: [TypeOrmModule.forFeature([QuestionGroup, Exam, Part])],
    controllers: [QuestionGroupsController],
    providers: [QuestionGroupsService, UploadService, PartsService]
})
export class QuestionGroupModule { }