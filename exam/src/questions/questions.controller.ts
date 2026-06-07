import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto, CreateQuestionInGroupDto, UpdateQuestionDto } from "src/dto/question_module.dto";
import type { BodyTokenPayload } from "src/interfaces/payload";

@Controller("question")
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) { }

    @Post("question-group/:questionGroupId")
    async createQuestionInGroup(@Body() body: CreateQuestionInGroupDto & BodyTokenPayload & { questionGroupId: string }) {
        return this.questionsService.createInGroup(body);
    }

    @Post("part/:partId")
    async createQuestion(@Body() body: CreateQuestionDto & BodyTokenPayload, @Param("partId") partId: string) {
        return this.questionsService.create(Object.assign(body, { partId }));
    }

    @Patch("/:questionId")
    async updateQuestion(@Body() body: UpdateQuestionDto & BodyTokenPayload) {
        return this.questionsService.update(body);
    }
}
