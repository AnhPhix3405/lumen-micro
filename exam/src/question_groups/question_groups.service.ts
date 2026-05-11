import { Injectable, } from "@nestjs/common";
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
            throw new Error("Unauthorized");
        }
        const questionGroup = await this.questionGroupRepository.save({
            partId: body.partId,
            groupOrder: body.groupOrder,
            content: body.content,
            transcript: body.transcript,
            type : body.type,
        })
        return questionGroup
    }

    async update(body: UpdateQuestionGroupDto & BodyTokenPayload) {

    }

    async uploadQuestionGroupAudio(
        req: Request,
        userId: string
    ): Promise<string> {
        return this.uploadService.uploadQuestionGroupAudio(req, userId);
    }
}