import { Body, Controller, Post, Req } from "@nestjs/common";
import { CreateExamDto } from "src/dto/exam_module.dto";
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
}