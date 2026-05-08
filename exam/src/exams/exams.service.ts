import { InjectRepository } from "@nestjs/typeorm";
import { CreateExamDto } from "src/dto/exam_module.dto";
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
}