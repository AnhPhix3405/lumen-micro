import { InjectRepository } from "@nestjs/typeorm";
import { CreateExamDto, UpdateExamDto } from "src/dto/exam_module.dto";
import { Exam } from "src/entities/exams.entity";
import { BodyTokenPayload, TokenPayload } from "src/interfaces/payload";
import { Repository } from "typeorm";

export class ExamService {
    constructor(@InjectRepository(Exam) private readonly examRepository: Repository<Exam>) { }
    async create(params: CreateExamDto & BodyTokenPayload) {
        const exam = this.examRepository.create({
            userId: params.payload.userId,
            name: params.name,
            description: params.description,
            durationMinutes: params.durationMinutes,
            totalScore: params.totalScore,
            visibility: params.visibility,
            thumbnailUrl: params.thumbnailUrl,
            examTypeId: params.examTypeId,
            isPublished: params.isPublished,
        });
        return await this.examRepository.save(exam);
    }

    async update(params: UpdateExamDto & BodyTokenPayload) {
        const exam = await this.examRepository.findOne({ where: { id: params.examId } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        if (exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }
        exam.name ??= params.name;
        exam.description ??= params.description;
        exam.durationMinutes ??= params.durationMinutes;
        exam.totalScore ??= params.totalScore;
        exam.visibility ??= params.visibility;
        exam.thumbnailUrl ??= params.thumbnailUrl;
        exam.examTypeId ??= params.examTypeId;
        exam.isPublished ??= params.isPublished;
        return await this.examRepository.save(exam);
    }

    async delete(params: { examId: string } & BodyTokenPayload) {
        const exam = await this.examRepository.findOne({ where: { id: params.examId } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        if (exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }
        return await this.examRepository.delete(exam);
    }

    async findOnePublished(params: { examId: string }) {
        const exam = await this.examRepository.findOne({ where: { id: params.examId, isPublished: true } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        return exam;
    }

    async findAllPublished(params: TokenPayload) {
        const exams = await this.examRepository.find({ where: { isPublished: true } });
        if (!exams) {
            throw new Error("Exam not found");
        }
        return exams;
    }

}