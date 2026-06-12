import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateExamDto, UpdateExamDto } from "src/dto/exam_module.dto";
import { Exam } from "src/entities/exams.entity";
import { ExamType } from "src/entities/exam-types.entity";
import { BodyTokenPayload, TokenPayload } from "src/interfaces/payload";

@Injectable()
export class ExamService {
    constructor(
        @InjectRepository(Exam) private readonly examRepository: Repository<Exam>,
        @InjectRepository(ExamType) private readonly examTypeRepository: Repository<ExamType>,
    ) { }
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
        return await this.examRepository.delete(params.examId);
    }

    async findAllPublished() {
        return await this.examRepository.find({
            where: { isPublished: true },
            relations: { examType: true },
            order: { createdAt: "DESC" },
        });
    }

    async findOneWithFullTree(examId: string) {
        const exam = await this.examRepository.findOne({
            where: { id: examId },
            relations: {
                examType: true,
                parts: {
                    questionGroups: {
                        questions: true,
                    },
                },
            },
            order: {
                parts: { partOrder: "ASC" },
            },
        });
        if (!exam) {
            throw new NotFoundException("Exam not found");
        }
        return exam;
    }

    async findMyExams(payload: TokenPayload) {
        return await this.examRepository.find({
            where: { userId: payload.userId },
            relations: { examType: true },
            order: { createdAt: "DESC" },
        });
    }

    async findAllExamTypes() {
        return await this.examTypeRepository.find({ order: { name: "ASC" } });
    }

    async findExamTypeById(id: string) {
        const examType = await this.examTypeRepository.findOne({ where: { id } });
        if (!examType) {
            throw new NotFoundException("Exam type not found");
        }
        return examType;
    }
}
