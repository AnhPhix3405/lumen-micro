import { Body, Controller, Patch, Post } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto, UpdateQuestionDto } from "src/dto/question_module.dto";
import type { BodyTokenPayload } from "src/interfaces/payload";

@Controller()
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) { }

    @Post("")
    async createQuestion(@Body() body: CreateQuestionDto & BodyTokenPayload) {
        return this.questionsService.create(body);
    }

    @Patch("")
    async updateQuestion(@Body() body: UpdateQuestionDto & BodyTokenPayload) {
        return this.questionsService.update(body);
    }
}
