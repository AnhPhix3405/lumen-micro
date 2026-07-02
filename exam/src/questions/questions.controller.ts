import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto, CreateQuestionInGroupDto, UpdateQuestionDto } from "src/dto/question_module.dto";
import type { BodyTokenPayload } from "src/interfaces/payload";
import type { Request } from "express";

@Controller("question")
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) { }

    @Post("question-group/:questionGroupId")
    async createQuestionInGroup(@Body() body: CreateQuestionInGroupDto & BodyTokenPayload & { questionGroupId: string }) {
        const data = await this.questionsService.createInGroup(body);
        return { data, message: "Question created successfully", status: HttpStatus.CREATED };
    }

    @Post("part/:partId")
    async createQuestion(@Body() body: CreateQuestionDto & BodyTokenPayload, @Param("partId") partId: string) {
        const data = await this.questionsService.create(Object.assign(body, { partId }));
        return { data, message: "Question created successfully", status: HttpStatus.CREATED };
    }

    @Patch("/:questionId")
    async updateQuestion(@Body() body: UpdateQuestionDto & BodyTokenPayload, @Param("questionId") questionId: string) {
        const data = await this.questionsService.update(Object.assign(body, { questionId }));
        return { data, message: "Question updated successfully", status: HttpStatus.OK };
    }

    @Patch("/:questionId/topics")
    async updateQuestionTopics(
        @Body() body: { topicIds: string[] } & BodyTokenPayload,
        @Param("questionId") questionId: string,
    ) {
        const data = await this.questionsService.updateTopics(questionId, body.topicIds, body);
        return { data, message: "Question topics updated successfully", status: HttpStatus.OK };
    }

    @Patch("/:questionId/upload-audio")
    async uploadQuestionAudio(
        @Req() req: Request,
        @Param("questionId") questionId: string
    ) {
        const userId = req.headers["x-user-id"] as string;
        const data = await this.questionsService.uploadQuestionAudio(req, userId, questionId);
        return { data, message: "Question audio uploaded successfully", status: HttpStatus.OK };
    }

    @Patch("/:questionId/upload-image")
    async uploadQuestionImage(
        @Req() req: Request,
        @Param("questionId") questionId: string
    ) {
        const userId = req.headers["x-user-id"] as string;
        const data = await this.questionsService.uploadQuestionImage(req, userId, questionId);
        return { data, message: "Question image uploaded successfully", status: HttpStatus.OK };
    }

    @Get("by-group/:questionGroupId")
    async findByGroup(@Param("questionGroupId") questionGroupId: string) {
        const data = await this.questionsService.findByGroupId(questionGroupId);
        return { data, message: "Questions fetched successfully", status: HttpStatus.OK };
    }

    @Get("by-part/:partId")
    async findByPart(@Param("partId") partId: string) {
        const data = await this.questionsService.findByPartId(partId);
        return { data, message: "Questions fetched successfully", status: HttpStatus.OK };
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        const data = await this.questionsService.findOneById(id);
        return { data, message: "Question fetched successfully", status: HttpStatus.OK };
    }
}
