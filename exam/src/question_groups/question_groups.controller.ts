import { Body, Controller, Param, Patch, Post, Req } from "@nestjs/common";
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
        await this.questionGroupsService.create(combined);
        return {
            message: "Question group created successfully"
        }
    }

    @Patch("/:questionGroupId/upload-audio")
    async uploadQuestionGroupAudio(
        @Req() req: Request,
        @Param("questionGroupId") questionGroupId: string
    ) {
        const userId = req.headers["x-user-id"] as string;
        await this.questionGroupsService.uploadQuestionGroupAudio(req, userId, questionGroupId);
        return {
            message: "Question group audio uploaded successfully"
        };
    }
}