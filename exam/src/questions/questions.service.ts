import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
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
        if (!questionGroup.part) {
            throw new Error("Question group is not associated with a part");
        }
        if (!questionGroup.part.exam) {
            throw new Error("Part is not associated with an exam");
        }
        if (questionGroup.part.exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }

        const question = this.questionRepository.create({
            questionGroup: { id: params.questionGroupId },
            type: "group",
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
            throw new NotFoundException("Part not found");
        }
        if (part.exam.userId !== params.payload.userId) {
            throw new UnauthorizedException("Unauthorized");
        }
        if (part.type === 'group') {
            throw new BadRequestException("Cannot create standalone question in group part");
        }
        const question = this.questionRepository.create({
            partId: params.partId,
            type: "separate",
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

    async update(params: UpdateQuestionDto & BodyTokenPayload) {
        const question = await this.questionRepository.findOne({
            where: { id: params.questionId },
            relations: { questionGroup: { part: { exam: true } } },
        });
        if (!question) {
            throw new NotFoundException("Question not found");
        }
        if (question.questionGroup) {
            if (question.questionGroup.part.exam.userId !== params.payload.userId) {
                throw new UnauthorizedException("Unauthorized");
            }
        }

        if (question.partId) {
            const part = await this.partRepository.findOne({
                where: { id: question.partId },
                relations: { exam: true },
            });
            if (!part) {
                throw new NotFoundException("Part not found");
            }
            if (part.exam.userId !== params.payload.userId) {
                throw new UnauthorizedException("Unauthorized");
            }
        }

        const updateData: Partial<Question> = {};
        if (params.content !== undefined) updateData.content = params.content;
        if (params.explanation !== undefined) updateData.explanation = params.explanation;
        if (params.audioUrl !== undefined) updateData.audioUrl = params.audioUrl;
        if (params.imageUrl !== undefined) updateData.imageUrl = params.imageUrl;
        if (params.options !== undefined) updateData.options = params.options;
        if (params.correctOption !== undefined) updateData.correctOption = params.correctOption;
        if (params.score !== undefined) updateData.score = params.score;
        if (params.questionOrder !== undefined) updateData.questionOrder = params.questionOrder;

        if (Object.keys(updateData).length > 0) {
            await this.questionRepository
                .createQueryBuilder()
                .update(Question)
                .set(updateData)
                .where("id = :id", { id: params.questionId })
                .execute();
        }

        return await this.questionRepository.findOne({
            where: { id: params.questionId },
        });
    }

    async findOneById(id: string) {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: { questionGroup: true },
        });
        if (!question) {
            throw new NotFoundException("Question not found");
        }
        return question;
    }

    async findByGroupId(questionGroupId: string) {
        return await this.questionRepository.find({
            where: { questionGroup: { id: questionGroupId } },
            order: { questionOrder: "ASC" },
        });
    }

    async findByPartId(partId: string) {
        return await this.questionRepository.find({
            where: { partId },
            order: { questionOrder: "ASC" },
        });
    }
}
