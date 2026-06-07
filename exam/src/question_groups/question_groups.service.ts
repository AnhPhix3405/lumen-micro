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
        // const reproduced_url = await this.uploadService.uploadQuestionGroupAudio(req, userId);
        // const updateResult = await this.questionGroupRepository.update({ id: questionGroupId }, { audioUrl: reproduced_url });
        // console.log(updateResult)
        // return reproduced_url;
        return "";
    }
}