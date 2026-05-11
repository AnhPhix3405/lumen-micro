import { Body, Controller, Patch, Post, Req } from "@nestjs/common";
import { CreateQuestionGroupDto } from "src/dto/question_group_module";
import { QuestionGroupsService } from "./question_groups.service";
import type { BodyTokenPayload } from "src/interfaces/payload";
import type { Request } from "express";
@Controller()
export class QuestionGroupsController {
    constructor(private readonly questionGroupsService: QuestionGroupsService) { }
    @Post("")
    async createQuestionGroup(@Body() body: CreateQuestionGroupDto & BodyTokenPayload) {
        console.log(body)
        return this.questionGroupsService.create(body);
    }

    @Patch("upload-audio")
    async uploadQuestionGroupAudio(
        @Req() req: Request,
        @Body() body: BodyTokenPayload
    ) {
        return this.questionGroupsService.uploadQuestionGroupAudio(req, body.payload.userId);
    }
}