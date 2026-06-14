import { InjectRepository } from "@nestjs/typeorm";
import { Exam } from "src/entities/exams.entity";
import { Repository } from "typeorm";
import { BodyTokenPayload } from "src/interfaces/payload";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PublishService {
    constructor(
        @InjectRepository(Exam) private readonly examRepository: Repository<Exam>,
    ) { }

    async requestPublishing(params: { examId: string } & BodyTokenPayload) {
        const exam = await this.examRepository.findOne({ where: { id: params.examId } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        if (exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }
        exam.visibility = "pending";
        return await this.examRepository.save(exam);
    }

    async draftExam(params: { examId: string } & BodyTokenPayload) {
        const exam = await this.examRepository.findOne({ where: { id: params.examId } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        if (exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }
        exam.visibility = "private";
        exam.isPublished = false;
        return await this.examRepository.save(exam);
    }
}