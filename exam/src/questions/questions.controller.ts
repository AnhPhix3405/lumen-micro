import { Body, Controller, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto, CreateQuestionInGroupDto, UpdateQuestionDto } from "src/dto/question_module.dto";
import type { BodyTokenPayload } from "src/interfaces/payload";

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
    async updateQuestion(@Body() body: UpdateQuestionDto & BodyTokenPayload) {
        const data = await this.questionsService.update(body);
        return { data, message: "Question updated successfully", status: HttpStatus.OK };
    }
}
