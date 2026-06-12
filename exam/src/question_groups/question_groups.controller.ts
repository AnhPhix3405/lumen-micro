import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req } from "@nestjs/common";
import { CreateQuestionGroupDto } from "src/dto/question_group_module";
import { QuestionGroupsService } from "./question_groups.service";
import type { BodyTokenPayload } from "src/interfaces/payload";
import type { Request } from "express";
@Controller("question-group")
export class QuestionGroupsController {
    constructor(private readonly questionGroupsService: QuestionGroupsService) { }
    @Post("/:partId")
    async createQuestionGroup(@Body() body: CreateQuestionGroupDto & BodyTokenPayload, @Param("partId") partId: string) {
        const combined = Object.assign(body, { partId });
        const data = await this.questionGroupsService.create(combined);
        return { data, message: "Question group created successfully", status: HttpStatus.CREATED };
    }

    @Patch("/:questionGroupId/upload-audio")
    async uploadQuestionGroupAudio(
        @Req() req: Request,
        @Param("questionGroupId") questionGroupId: string
    ) {
        const userId = req.headers["x-user-id"] as string;
        const data = await this.questionGroupsService.uploadQuestionGroupAudio(req, userId, questionGroupId);
        return { data, message: "Question group audio uploaded successfully", status: HttpStatus.OK };
    }

    @Get("part/:partId")
    async findGroupsByPart(@Param("partId") partId: string) {
        const data = await this.questionGroupsService.findByPartId(partId);
        return { data, message: "Question groups fetched successfully", status: HttpStatus.OK };
    }

    @Get(":id")
    async findGroupWithQuestions(@Param("id") id: string) {
        const data = await this.questionGroupsService.findOneWithQuestions(id);
        return { data, message: "Question group fetched successfully", status: HttpStatus.OK };
    }
}
