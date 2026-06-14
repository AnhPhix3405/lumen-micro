import { Module } from "@nestjs/common";
import { ExamController } from "./exams.controller";
import { AdminExamController } from "./admin.controller";
import { ExamService } from "./exams.service";
import { PublishService } from "./publish.service";
import { ModerationService } from "./moderation.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exam } from "src/entities/exams.entity";
import { ExamType } from "src/entities/exam-types.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Exam, ExamType])
    ],
    controllers: [ExamController, AdminExamController],
    providers: [ExamService, PublishService, ModerationService]
})

export class ExamModule { }
