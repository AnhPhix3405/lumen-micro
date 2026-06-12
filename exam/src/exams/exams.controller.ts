import { Body, Controller, HttpStatus, Patch, Post } from "@nestjs/common";
import { CreateExamDto, UpdateExamDto } from "src/dto/exam_module.dto";
import { ExamService } from "./exams.service";
import { BodyTokenPayload } from "src/interfaces/payload";

@Controller()
export class ExamController {
    constructor(private readonly examService: ExamService) { }
    @Post("")
    async createExam(@Body() body: CreateExamDto & BodyTokenPayload) {
        const data = await this.examService.create(body);
        return { data, message: "Exam created successfully", status: HttpStatus.CREATED };
    }

    @Patch("")
    async updateExam(@Body() body: UpdateExamDto & BodyTokenPayload) {
        const data = await this.examService.update(body);
        return { data, message: "Exam updated successfully", status: HttpStatus.OK };
    }
}