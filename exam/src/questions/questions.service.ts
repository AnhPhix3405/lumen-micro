import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Question } from "src/entities/questions.entity";
import { QuestionGroup } from "src/entities/question-groups.entity";
import { Part } from "src/entities/parts.entity";
import { Exam } from "src/entities/exams.entity";
import { CreateQuestionDto, CreateQuestionInGroupDto, UpdateQuestionDto } from "src/dto/question_module.dto";
import type { BodyTokenPayload } from "src/interfaces/payload";
@Injectable()
export class QuestionsService {
    constructor(
        @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
        @InjectRepository(QuestionGroup) private readonly questionGroupRepository: Repository<QuestionGroup>,
        @InjectRepository(Part) private readonly partRepository: Repository<Part>,
        @InjectRepository(Exam) private readonly examRepository: Repository<Exam>,
    ) { }

    async createInGroup(params: CreateQuestionInGroupDto & BodyTokenPayload) {
        const questionGroup = await this.questionGroupRepository.findOne({
            where: { id: params.questionGroupId },
            relations: { part: { exam: true } },
        });
        if (!questionGroup) {
            throw new Error("Question group not found");
        }
        if (questionGroup.part.exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }

        const question = this.questionRepository.create({
            questionGroup: { id: params.questionGroupId },
            type: params.type,
            content: params.content,
            explanation: params.explanation,
            audioUrl: params.audioUrl,
            imageUrl: params.imageUrl,
            options: params.options,
            correctOption: params.correctOption,
            score: params.score ?? 1,
            questionOrder: params.questionOrder,
        });
        return await this.questionRepository.save(question);
    }

    async create(params: CreateQuestionDto & BodyTokenPayload) {
        const part = await this.partRepository.findOne({
            where: { id: params.partId },
            relations: { exam: true },
        });
        if (!part) {
            throw new Error("Part not found");
        }
        if (part.exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }
        const question = this.questionRepository.create({
            partId: params.partId,
            type: params.type,
            content: params.content,
            explanation: params.explanation,
            audioUrl: params.audioUrl,
            imageUrl: params.imageUrl,
            options: params.options,
            correctOption: params.correctOption,
            score: params.score ?? 1,
            questionOrder: params.questionOrder,
        });
        return await this.questionRepository.save(question);
    }

    async update(body: UpdateQuestionDto & BodyTokenPayload) {
        const question = await this.questionRepository.findOne({
            where: { id: body.questionId },
            relations: { questionGroup: { part: { exam: true } } },
        });
        if (!question) {
            throw new Error("Question not found");
        }
        if (question.questionGroup.part.exam.userId !== body.payload.userId) {
            throw new Error("Unauthorized");
        }

        if (body.type !== undefined) question.type = body.type;
        if (body.content !== undefined) question.content = body.content;
        if (body.explanation !== undefined) question.explanation = body.explanation;
        if (body.audioUrl !== undefined) question.audioUrl = body.audioUrl;
        if (body.imageUrl !== undefined) question.imageUrl = body.imageUrl;
        if (body.options !== undefined) question.options = body.options;
        if (body.correctOption !== undefined) question.correctOption = body.correctOption;
        if (body.score !== undefined) question.score = body.score;
        if (body.questionOrder !== undefined) question.questionOrder = body.questionOrder;

        return await this.questionRepository.save(question);
    }
}
