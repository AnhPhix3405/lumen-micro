import { Module } from "@nestjs/common";
import { ExamController } from "./exams.controller";
import { ExamService } from "./exams.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exam } from "src/entities/exams.entity";
import { ExamType } from "src/entities/exam-types.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Exam, ExamType])
    ],
    controllers: [ExamController],
    providers: [ExamService]
})

export class ExamModule { }
