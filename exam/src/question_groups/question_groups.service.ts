import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionGroup } from "src/entities/question-groups.entity";
import { Repository } from "typeorm";
import { CreateQuestionGroupDto, UpdateQuestionGroupDto } from "src/dto/question_group_module";
import { BodyTokenPayload } from "src/interfaces/payload";
import { UploadService } from "src/services/upload.service";
import { Request } from "express";
import { PartsService } from "src/parts/parts.service";
@Injectable()
export class QuestionGroupsService {
    constructor(
        @InjectRepository(QuestionGroup)
        private readonly questionGroupRepository: Repository<QuestionGroup>,
        private readonly uploadService: UploadService,
        private readonly partsService: PartsService,
    ) { }
    async create(body: CreateQuestionGroupDto & BodyTokenPayload) {
        const part = await this.partsService.findOneById(body.partId);
        if (!part) {
            throw new Error("Part not found");
        }
        if (part.exam.userId !== body.payload.userId) {
            throw new UnauthorizedException("Unauthorized");
        }
        if (part.type === 'standalone') {
            throw new BadRequestException("Cannot create group question in standalone part");
        }
        const questionGroup = await this.questionGroupRepository.create({
            partId: body.partId,
            groupOrder: body.groupOrder,
            content: body.content,
            transcript: body.transcript,
            type: body.type,
        })
        await this.questionGroupRepository.save(questionGroup)
        return questionGroup
    }

    async update(body: UpdateQuestionGroupDto & BodyTokenPayload) {

    }

    async uploadQuestionGroupAudio(
        req: Request,
        userId: string,
        questionGroupId: string
    ): Promise<string> {
        const secure_url = await this.uploadService.uploadQuestionGroupAudio(req, userId);
        const questionGroup = await this.questionGroupRepository.findOne({
            where: { id: questionGroupId },
            relations: { part: { exam: true } },
        });
        if (!questionGroup) {
            throw new NotFoundException("Question group not found");
        }
        if (questionGroup.part.exam.userId !== userId) {
            throw new UnauthorizedException("Unauthorized");
        }
        questionGroup.audioUrl = secure_url;
        await this.questionGroupRepository.save(questionGroup);
        return secure_url;
    }

    async findByPartId(partId: string) {
        return await this.questionGroupRepository.find({
            where: { partId },
            relations: { questions: true },
            order: { groupOrder: "ASC", questions: { questionOrder: "ASC" } },
        });
    }

    async findOneWithQuestions(id: string) {
        const questionGroup = await this.questionGroupRepository.findOne({
            where: { id },
            relations: { questions: true },
            order: { questions: { questionOrder: "ASC" } },
        });
        if (!questionGroup) {
            throw new NotFoundException("Question group not found");
        }
        return questionGroup;
    }
}
