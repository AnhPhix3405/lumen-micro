import { Body, Controller, Patch, Post, Put, Req } from "@nestjs/common";
import { CreateExamDto, UpdateExamDto } from "src/dto/exam_module.dto";
import { ExamService } from "./exams.service";
import { BodyTokenPayload, TokenPayload } from "src/interfaces/payload";

@Controller()
export class ExamController {
    constructor(private readonly examService: ExamService) { }
    @Post("")
    async createExam(@Body() body: CreateExamDto & BodyTokenPayload) {
        console.log(body)
        return this.examService.create(body);
    }

    @Patch("")
    async updateExam(@Body() body: UpdateExamDto & BodyTokenPayload) {
        console.log(body)
        return this.examService.update(body);
    }
}