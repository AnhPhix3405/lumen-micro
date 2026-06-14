import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req } from "@nestjs/common";
import { CreateExamDto, UpdateExamDto } from "src/dto/exam_module.dto";
import { ExamService } from "./exams.service";
import { PublishService } from "./publish.service";
import type { BodyTokenPayload } from "src/interfaces/payload";
import type { Request } from "express";

@Controller()
export class ExamController {
    constructor(
        private readonly examService: ExamService,
        private readonly publishService: PublishService,
    ) { }
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

    @Get()
    async findAllPublished() {
        const data = await this.examService.findAllPublished();
        return { data, message: "Exams fetched successfully", status: HttpStatus.OK };
    }

    @Post("publish/request")
    async requestPublishing(@Body() body: { examId: string } & BodyTokenPayload) {
        const data = await this.publishService.requestPublishing(body);
        return { data, message: "Publish request submitted", status: HttpStatus.OK };
    }

    @Get("my/all")
    async findMyExams(@Req() req: Request) {
        const payload = {
            userId: req.headers["x-user-id"] as string,
            accountId: req.headers["x-account-id"] as string,
        };
        const data = await this.examService.findMyExams(payload);
        return { data, message: "My exams fetched successfully", status: HttpStatus.OK };
    }

    @Get("exam-types")
    async findAllExamTypes() {
        const data = await this.examService.findAllExamTypes();
        return { data, message: "Exam types fetched successfully", status: HttpStatus.OK };
    }

    @Get("exam-types/:id")
    async findExamTypeById(@Param("id") id: string) {
        const data = await this.examService.findExamTypeById(id);
        return { data, message: "Exam type fetched successfully", status: HttpStatus.OK };
    }

    @Get(":examId")
    async findOneWithFullTree(@Param("examId") examId: string) {
        const data = await this.examService.findOneWithFullTree(examId);
        return { data, message: "Exam fetched successfully", status: HttpStatus.OK };
    }
}
