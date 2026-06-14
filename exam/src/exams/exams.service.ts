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
            thumbnailUrl: params.thumbnailUrl,
            examTypeId: params.examTypeId,
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
        console.log(params)
        if (params.name !== undefined) exam.name = params.name;
        if (params.description !== undefined) exam.description = params.description;
        if (params.durationMinutes !== undefined) exam.durationMinutes = params.durationMinutes;
        if (params.totalScore !== undefined) exam.totalScore = params.totalScore;
        if (params.thumbnailUrl !== undefined) exam.thumbnailUrl = params.thumbnailUrl;
        if (params.examTypeId !== undefined) exam.examTypeId = params.examTypeId;
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
